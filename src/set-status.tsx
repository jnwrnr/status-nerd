import {
  Action,
  ActionPanel,
  Form,
  Icon,
  Toast,
  popToRoot,
  showToast,
} from "@raycast/api";
import { useState } from "react";
import { applyStatus, SERVICE_LABELS, ServiceKey } from "./lib/api";
import { canUseAI, generateStatuses, Suggestion } from "./lib/ai";
import { defaultServices, getPrefs } from "./lib/preferences";
import { randomStatus } from "./lib/statuses";

export default function Command() {
  const prefs = getPrefs();
  const [services, setServices] = useState<string[]>(defaultServices(prefs));
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("");
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const hasStatus = text.trim().length > 0;

  function apply(s: Suggestion) {
    setEmoji(s.emoji);
    setText(s.text);
  }

  async function generate() {
    if (!canUseAI()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Raycast Pro required for AI",
        message: "Use ⌘R to shuffle from the built-in list instead",
      });
      return;
    }
    setLoading(true);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Generating suggestions…",
    });
    try {
      const results = await generateStatuses(notes);
      setSuggestions(results);
      setIndex(0);
      apply(results[0]);
      toast.style = Toast.Style.Success;
      toast.title = `${results.length} suggestions — ⌘R to shuffle`;
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "AI failed";
      toast.message = error instanceof Error ? error.message : String(error);
    } finally {
      setLoading(false);
    }
  }

  function shuffle() {
    if (suggestions.length > 0) {
      const next = (index + 1) % suggestions.length;
      setIndex(next);
      apply(suggestions[next]);
    } else {
      // No AI suggestions yet — fall back to the built-in list.
      apply(randomStatus());
    }
  }

  async function submit() {
    if (services.length === 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Pick at least one service",
      });
      return;
    }
    if (!text.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No status yet",
        message: "Generate with AI (⌘G) or shuffle from the list (⌘R)",
      });
      return;
    }

    setLoading(true);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Setting status…",
    });
    const results = await applyStatus(
      services as ServiceKey[],
      emoji.trim() || ":speech_balloon:",
      text.trim(),
      prefs,
    );
    setLoading(false);

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

  const generateAction = (
    <Action
      title={suggestions.length > 0 ? "Generate Again" : "Generate from Notes"}
      icon={Icon.Stars}
      shortcut={{ modifiers: ["cmd"], key: "g" }}
      onAction={generate}
    />
  );
  const shuffleAction = (
    <Action
      title={
        suggestions.length > 0 ? "Shuffle Suggestion" : "Shuffle from List"
      }
      icon={Icon.Shuffle}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
      onAction={shuffle}
    />
  );
  const setAction = (
    <Action.SubmitForm title="Set Status" icon={Icon.Check} onSubmit={submit} />
  );

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          {/* Before a status exists, Enter generates. Once there is one, Enter sets it. */}
          {hasStatus ? (
            <>
              {setAction}
              {shuffleAction}
              {generateAction}
            </>
          ) : (
            <>
              {generateAction}
              {shuffleAction}
              {setAction}
            </>
          )}
        </ActionPanel>
      }
    >
      <Form.TagPicker
        id="services"
        title="Services"
        value={services}
        onChange={setServices}
      >
        {(Object.keys(SERVICE_LABELS) as ServiceKey[]).map((key) => (
          <Form.TagPicker.Item
            key={key}
            value={key}
            title={SERVICE_LABELS[key]}
          />
        ))}
      </Form.TagPicker>
      <Form.TextArea
        id="notes"
        title="Notes"
        placeholder="A few keywords, e.g. sprint planning, too many meetings, coffee"
        info="Press ⌘G to turn these into status suggestions with Raycast AI"
        value={notes}
        onChange={setNotes}
      />
      <Form.Separator />
      {suggestions.length > 0 && (
        <Form.Description
          title="Suggestion"
          text={`${index + 1} / ${suggestions.length}  ·  ⌘R to shuffle, ⌘G to regenerate`}
        />
      )}
      <Form.TextField
        id="emoji"
        title="Emoji"
        placeholder=":fire:"
        info="Slack-style shortcode. GitLab drops the colons; GitHub keeps them."
        value={emoji}
        onChange={setEmoji}
      />
      <Form.TextField
        id="text"
        title="Status"
        placeholder="Generate from notes (⌘G) or shuffle the list (⌘R)"
        value={text}
        onChange={setText}
      />
    </Form>
  );
}
