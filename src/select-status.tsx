import {
  Action,
  ActionPanel,
  Form,
  Icon,
  List,
  popToRoot,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";
import { applyStatus, SERVICE_LABELS } from "./lib/api";
import { defaultServices, getPrefs } from "./lib/preferences";
import { STATUSES } from "./lib/statuses";
import {
  addRecent,
  addSaved,
  getRecent,
  getSaved,
  removeRecent,
  removeSaved,
  StoredStatus,
} from "./lib/storage";

function normalizeEmoji(raw: string): string {
  let emoji = raw.trim() || ":speech_balloon:";
  if (!emoji.startsWith(":")) emoji = `:${emoji}`;
  if (!emoji.endsWith(":")) emoji = `${emoji}:`;
  return emoji;
}

export default function Command() {
  const prefs = getPrefs();
  const {
    data: recent,
    isLoading: loadingRecent,
    revalidate: reloadRecent,
  } = usePromise(getRecent);
  const {
    data: saved,
    isLoading: loadingSaved,
    revalidate: reloadSaved,
  } = usePromise(getSaved);

  async function setChosen(item: StoredStatus) {
    const services = defaultServices(prefs);
    if (services.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No default services",
        message: "Enable at least one default service in preferences",
      });
      return;
    }
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Setting status…",
    });
    const results = await applyStatus(services, item.emoji, item.text, prefs);
    await addRecent({
      emoji: item.emoji,
      text: item.text,
      gitlab_emoji: item.gitlab_emoji,
    });
    reloadRecent();

    const ok = results
      .filter((r) => r.ok)
      .map((r) => SERVICE_LABELS[r.service]);
    const failed = results.filter((r) => !r.ok);
    if (failed.length === 0) {
      toast.style = Toast.Style.Success;
      toast.title = `Status set on ${ok.join(", ")}`;
      await popToRoot();
    } else if (ok.length === 0) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed";
      toast.message = failed
        .map((f) => `${SERVICE_LABELS[f.service]}: ${f.error}`)
        .join("\n");
    } else {
      toast.style = Toast.Style.Success;
      toast.title = `Set on ${ok.join(", ")}`;
      toast.message = `Failed: ${failed.map((f) => `${SERVICE_LABELS[f.service]} (${f.error})`).join(", ")}`;
    }
  }

  function itemActions(
    item: StoredStatus,
    source: "recent" | "saved" | "default",
  ) {
    return (
      <ActionPanel>
        <Action
          title="Set Status"
          icon={Icon.Check}
          onAction={() => setChosen(item)}
        />
        {source !== "saved" && (
          <Action
            title="Save to Saved"
            icon={Icon.Star}
            shortcut={{ modifiers: ["cmd"], key: "s" }}
            onAction={async () => {
              await addSaved({
                emoji: item.emoji,
                text: item.text,
                gitlab_emoji: item.gitlab_emoji,
              });
              await showToast({ style: Toast.Style.Success, title: "Saved" });
              reloadSaved();
            }}
          />
        )}
        {source === "saved" && (
          <Action
            title="Remove from Saved"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            shortcut={{ modifiers: ["cmd"], key: "backspace" }}
            onAction={async () => {
              await removeSaved(item);
              await showToast({ style: Toast.Style.Success, title: "Removed" });
              reloadSaved();
            }}
          />
        )}
        {source === "recent" && (
          <Action
            title="Remove from Recent"
            icon={Icon.XMarkCircle}
            shortcut={{ modifiers: ["cmd"], key: "backspace" }}
            onAction={async () => {
              await removeRecent(item);
              reloadRecent();
            }}
          />
        )}
        <Action.Push
          title="Create New Status…"
          icon={Icon.Plus}
          shortcut={{ modifiers: ["cmd"], key: "n" }}
          target={<NewStatusForm onSaved={reloadSaved} />}
        />
      </ActionPanel>
    );
  }

  function renderItem(
    item: StoredStatus,
    source: "recent" | "saved" | "default",
    index: number,
  ) {
    return (
      <List.Item
        key={`${source}-${index}-${item.emoji}-${item.text}`}
        title={item.text}
        accessories={[{ tag: item.emoji }]}
        actions={itemActions(item, source)}
      />
    );
  }

  return (
    <List
      isLoading={loadingRecent || loadingSaved}
      searchBarPlaceholder="Search statuses…"
    >
      <List.Section title="Recent">
        {(recent ?? []).map((item, i) => renderItem(item, "recent", i))}
      </List.Section>
      <List.Section title="Saved">
        {(saved ?? []).map((item, i) => renderItem(item, "saved", i))}
      </List.Section>
      <List.Section title="Defaults">
        {STATUSES.map((item, i) => renderItem(item, "default", i))}
      </List.Section>
    </List>
  );
}

function NewStatusForm({ onSaved }: { onSaved: () => void }) {
  const { pop } = useNavigation();
  const [emoji, setEmoji] = useState(":speech_balloon:");
  const [text, setText] = useState("");

  async function submit() {
    if (!text.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Status text is empty",
      });
      return;
    }
    await addSaved({ emoji: normalizeEmoji(emoji), text: text.trim() });
    await showToast({ style: Toast.Style.Success, title: "Saved" });
    onSaved();
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Status"
            icon={Icon.Star}
            onSubmit={submit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="emoji"
        title="Emoji"
        placeholder=":fire:"
        info="Slack-style shortcode"
        value={emoji}
        onChange={setEmoji}
      />
      <Form.TextField
        id="text"
        title="Status"
        placeholder="Your status message"
        value={text}
        onChange={setText}
      />
    </Form>
  );
}
