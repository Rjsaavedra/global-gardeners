"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type PlantOption = { id: number; name: string; species: string; image: string; identified: boolean };
type TopicOption = { id: string; label: string };
type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
type ConversationMessage = { role: "user" | "assistant" | "system"; content: string };
const DEMO_ASSISTANT_BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.";

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 text-[#737373]" fill="none" viewBox="0 0 24 24">
      <path d="M19 11.25C19.4142 11.25 19.75 11.5858 19.75 12C19.75 12.4142 19.4142 12.75 19 12.75H5C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H19Z" fill="currentColor" />
      <path d="M11.25 19V5C11.25 4.58579 11.5858 4.25 12 4.25C12.4142 4.25 12.75 4.58579 12.75 5V19C12.75 19.4142 12.4142 19.75 12 19.75C11.5858 19.75 11.25 19.4142 11.25 19Z" fill="currentColor" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6 text-[#31674c]" fill="none" viewBox="0 0 24 24">
      <path d="M12.5303 4.46967C12.2374 4.17678 11.7626 4.17678 11.4697 4.46967L6.46967 9.46967C6.17678 9.76256 6.17678 10.2374 6.46967 10.5303C6.76256 10.8232 7.23744 10.8232 7.53033 10.5303L11.25 6.81066V19C11.25 19.4142 11.5858 19.75 12 19.75C12.4142 19.75 12.75 19.4142 12.75 19V6.81066L16.4697 10.5303C16.7626 10.8232 17.2374 10.8232 17.5303 10.5303C17.8232 10.2374 17.8232 9.76256 17.5303 9.46967L12.5303 4.46967Z" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-[#737373]" fill="none" viewBox="0 0 20 20">
      <path d="M8.75 2.91699C5.52834 2.91699 2.91667 5.52866 2.91667 8.75033C2.91667 11.972 5.52834 14.5837 8.75 14.5837C10.2394 14.5837 11.5985 14.0259 12.6293 13.1083L16.5939 17.0729C16.838 17.317 17.2337 17.317 17.4778 17.0729C17.722 16.8288 17.722 16.433 17.4778 16.1889L13.5132 12.2243C14.4308 11.1935 14.9887 9.83442 14.9887 8.34506C14.9887 5.1234 12.377 2.51172 9.15533 2.51172H8.75Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MyGrowMateChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [isTopicConfirmDrawerOpen, setIsTopicConfirmDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "identified" | "unidentified">("all");
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [attachedPlantId, setAttachedPlantId] = useState<number | null>(null);
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [plantSearch, setPlantSearch] = useState("");
  const [attachedPlantName, setAttachedPlantName] = useState("None Selected");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameDrawerOpen, setIsRenameDrawerOpen] = useState(false);
  const [conversationName, setConversationName] = useState("Global Gardeners");
  const [renameValue, setRenameValue] = useState("Global Gardeners");
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [didHydrateFromLog, setDidHydrateFromLog] = useState(false);
  const [didHydrateFromConversation, setDidHydrateFromConversation] = useState(false);
  const [savingLogByMessageId, setSavingLogByMessageId] = useState<Record<string, boolean>>({});
  const [savedLogByMessageId, setSavedLogByMessageId] = useState<Record<string, boolean>>({});
  const [topicOptions, setTopicOptions] = useState<TopicOption[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [attachedTopicLabel, setAttachedTopicLabel] = useState<string>("None Selected");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationPlantId, setConversationPlantId] = useState<number | null>(null);
  const identifiedPlants = useMemo(() => plantOptions.filter((plant) => plant.identified), [plantOptions]);
  const unidentifiedPlants = useMemo(() => plantOptions.filter((plant) => !plant.identified), [plantOptions]);
  const tabPlants = activeTab === "all" ? plantOptions : activeTab === "identified" ? identifiedPlants : unidentifiedPlants;
  const normalizedSearch = plantSearch.trim().toLowerCase();
  const activePlants = useMemo(() => (!normalizedSearch ? tabPlants : tabPlants.filter((plant) => plant.name.toLowerCase().includes(normalizedSearch) || plant.species.toLowerCase().includes(normalizedSearch))), [normalizedSearch, tabPlants]);
  const selectedPlant = plantOptions.find((plant) => plant.id === selectedPlantId);
  const topicRows = useMemo(() => {
    if (topicOptions.length === 0) return [];
    const rows: string[][] = [];
    for (let i = 0; i < topicOptions.length; i += 3) {
      rows.push(topicOptions.slice(i, i + 3).map((topic) => topic.label));
    }
    return rows;
  }, [topicOptions]);
  const persistMessage = async (userMessage: string, assistantMessage?: string, conversationTitleOverride?: string) => {
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const derivedTitle =
        conversationTitleOverride?.trim()
          ? conversationTitleOverride.trim()
          : attachedTopicLabel !== "None Selected"
          ? attachedTopicLabel
          : attachedPlantName !== "None Selected"
            ? attachedPlantName
            : "Global Gardeners";
      const createResponse = await fetch("/api/my-grow-mate/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: derivedTitle,
          plantId: attachedPlantId,
        }),
      });
      if (!createResponse.ok) return null;
      const created = (await createResponse.json()) as { id?: string };
      if (!created.id) return null;
      activeConversationId = created.id;
      setConversationId(created.id);
    }

    const messageResponse = await fetch(`/api/my-grow-mate/conversations/${activeConversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, assistantMessage }),
    });
    if (!messageResponse.ok) return null;
    return activeConversationId;
  };

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    const assistantMessage: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      content: DEMO_ASSISTANT_BODY,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsConversationStarted(true);
    setMessageText("");
    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMessage]);
    }, 700);
    void persistMessage(trimmed, DEMO_ASSISTANT_BODY);
  };

  const handleSaveAsLog = async (messageId: string, content: string) => {
    if (savingLogByMessageId[messageId] || savedLogByMessageId[messageId]) return;
    setSavingLogByMessageId((prev) => ({ ...prev, [messageId]: true }));
    try {
      const payload = {
        title: "Care Plan",
        topic: "Care Plan",
        content,
        plantId: attachedPlantId,
        conversationId,
      };
      const response = await fetch("/api/my-grow-mate/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setSavedLogByMessageId((prev) => ({ ...prev, [messageId]: false }));
        return;
      }
      setSavedLogByMessageId((prev) => ({ ...prev, [messageId]: true }));
    } catch {
      setSavedLogByMessageId((prev) => ({ ...prev, [messageId]: false }));
    } finally {
      setSavingLogByMessageId((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  useEffect(() => {
    const fromLog = searchParams.get("fromLog");
    if (!fromLog || didHydrateFromLog) return;
    setDidHydrateFromLog(true);
    setIsConversationStarted(true);
    setMessages([
      { id: "seed-user", role: "user", content: "Can you summarize this saved log?" },
      {
        id: "seed-assistant",
        role: "assistant",
        content: DEMO_ASSISTANT_BODY,
      },
    ]);
    setConversationName("Global Gardeners");
    setAttachedPlantName(fromLog === "2" || fromLog === "5" ? "Monstera" : "Plant name");
  }, [searchParams, didHydrateFromLog]);

  useEffect(() => {
    const fromConversation = searchParams.get("fromConversation") ?? searchParams.get("conversationId");
    if (!fromConversation || didHydrateFromConversation) return;
    setDidHydrateFromConversation(true);
    setConversationId(fromConversation);
    setIsConversationStarted(true);
    const loadConversation = async () => {
      const [messagesRes, conversationsRes] = await Promise.all([
        fetch(`/api/my-grow-mate/conversations/${fromConversation}/messages`),
        fetch("/api/my-grow-mate/conversations"),
      ]);
      if (conversationsRes.ok) {
        const payload = (await conversationsRes.json()) as {
          conversations?: Array<{ id: string; title: string; plantId: string | null }>;
        };
        const currentConversation = payload.conversations?.find((c) => c.id === fromConversation);
        if (!currentConversation) return;
        const plantId = currentConversation.plantId ? Number(currentConversation.plantId) : null;
        setConversationPlantId(Number.isInteger(plantId) ? plantId : null);
        if (currentConversation.title && currentConversation.title !== "Global Gardeners") {
          setAttachedTopicLabel(currentConversation.title);
        }
      }
      if (!messagesRes.ok) return;
      const payload = (await messagesRes.json()) as {
        messages?: ConversationMessage[];
      };
      const messages = payload.messages ?? [];
      const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
      const isChatMessage = (
        message: ConversationMessage,
      ): message is { role: ChatMessage["role"]; content: string } =>
        message.role === "user" || message.role === "assistant";
      const normalized: ChatMessage[] = messages
        .filter(isChatMessage)
        .map((m, idx) => ({ id: `${m.role}-${idx}`, role: m.role, content: m.content }));
      if (normalized.length > 0) setMessages(normalized);
      else if (lastUserMessage) setMessages([{ id: "fallback", role: "user", content: lastUserMessage.content }]);
    };
    void loadConversation();
  }, [searchParams, didHydrateFromConversation]);

  useEffect(() => {
    if (!conversationPlantId) return;
    const matchedPlant = plantOptions.find((plant) => plant.id === conversationPlantId);
    if (!matchedPlant) return;
    setAttachedPlantId(matchedPlant.id);
    setAttachedPlantName(matchedPlant.name);
    if (attachedTopicLabel === "None Selected") {
      setAttachedTopicLabel("None Selected");
    }
  }, [conversationPlantId, plantOptions, attachedTopicLabel]);

  useEffect(() => {
    let cancelled = false;
    const loadTopics = async () => {
      const response = await fetch("/api/my-grow-mate/topics");
      if (!response.ok) return;
      const payload = (await response.json()) as { topics?: TopicOption[] };
      if (cancelled || !Array.isArray(payload.topics)) return;
      setTopicOptions(payload.topics);
    };
    void loadTopics();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isRenameDrawerOpen) return;
    const contextualTitle =
      attachedTopicLabel !== "None Selected"
        ? attachedTopicLabel
        : attachedPlantName !== "None Selected"
          ? attachedPlantName
          : "Global Gardeners";
    setRenameValue(contextualTitle);
  }, [isRenameDrawerOpen, attachedTopicLabel, attachedPlantName]);

  useEffect(() => {
    let cancelled = false;
    const loadPlants = async () => {
      const response = await fetch("/api/plants");
      if (!response.ok) return;
      const payload = (await response.json()) as {
        plants?: Array<{ id: number; commonName: string; scientificName: string | null; coverPhotoUrl: string | null }>;
      };
      if (cancelled || !Array.isArray(payload.plants)) return;
      const nextOptions: PlantOption[] = payload.plants.map((plant) => ({
        id: plant.id,
        name: plant.commonName,
        species: plant.scientificName ?? "Unknown species",
        image: plant.coverPhotoUrl ?? "/images/figma/placeholder-expired.png",
        identified: Boolean(plant.scientificName && plant.scientificName.trim()),
      }));
      setPlantOptions(nextOptions);
    };
    void loadPlants();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="client-main h-dvh w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] text-[#182a17]">
      <section className="client-shell mx-auto h-dvh w-full max-w-[390px] overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <div className="relative h-full w-full bg-[#f8f6f1]">
          {(isHeaderMenuOpen || isPlusMenuOpen || isDeleteDrawerOpen || isDeleteModalOpen || isRenameDrawerOpen) ? (
            <button
              type="button"
              aria-label="Close menus"
              onClick={() => {
                setIsHeaderMenuOpen(false);
                setIsPlusMenuOpen(false);
                if (!isDeleteModalOpen) {
                  setIsDeleteDrawerOpen(false);
                  setIsRenameDrawerOpen(false);
                }
              }}
              className={`absolute inset-0 z-20 ${isDeleteDrawerOpen || isDeleteModalOpen || isRenameDrawerOpen ? "bg-[rgba(23,23,23,0.5)]" : "bg-transparent"}`}
            />
          ) : null}

          <header className="absolute left-0 top-0 z-20 flex h-[72px] w-full items-center justify-between border border-[#e5e5e5] bg-white px-4 py-4">
            <Link href="/my-grow-mate" aria-label="Back" className="shrink-0">
              <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
            </Link>
            {!isConversationStarted ? (
              <div className="flex items-center gap-2 px-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf4] p-[6px]">
                  <Image src="/icons/chat-menus/leaf.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <p className="whitespace-nowrap text-[16px] font-medium leading-6 text-black">Plant: None Selected</p>
              </div>
            ) : (
              <div className="flex flex-col items-center px-2">
                <p className="text-[18px] font-semibold leading-[27px] text-[#31674c]">Global Gardeners</p>
                <div className="flex items-center">
                  <p className="whitespace-nowrap text-[16px] font-medium leading-6 text-black">
                    {attachedTopicLabel !== "None Selected" ? `Topic: ${attachedTopicLabel}` : `Plant: ${attachedPlantName}`}
                  </p>
                </div>
              </div>
            )}
            <button
              type="button"
              aria-label="More options"
              onClick={() => {
                setIsHeaderMenuOpen((v) => !v);
                setIsPlusMenuOpen(false);
              }}
              className="mr-1 shrink-0 rounded-full bg-[#f5f5f5] p-2"
            >
              <Image src="/icons/new-plant/ellipsis-vertical.svg" alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6" />
            </button>
          </header>

          {isHeaderMenuOpen ? (
            <div className="absolute left-[135px] top-[76px] z-40 w-[238px] rounded-[8px] border border-[#e5e5e5] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              <button
                type="button"
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  const contextualTitle =
                    attachedTopicLabel !== "None Selected"
                      ? attachedTopicLabel
                      : attachedPlantName !== "None Selected"
                        ? attachedPlantName
                        : "Global Gardeners";
                  setRenameValue(contextualTitle);
                  setIsRenameDrawerOpen(true);
                }}
                className="flex min-h-[36px] w-full items-center gap-2 px-3 py-3 text-left"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fafafa] p-[6px]">
                  <Image src="/icons/chat-menus/rename.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <span className="text-[14px] font-normal leading-5 text-[#333333]">Rename</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  setIsDeleteDrawerOpen(true);
                }}
                className="flex min-h-[36px] w-full items-center gap-2 px-3 py-3 text-left"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fef2f2] p-[6px]">
                  <Image src="/icons/chat-menus/delete.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <span className="text-[14px] font-normal leading-5 text-[#ef4444]">Delete</span>
              </button>
            </div>
          ) : null}

          {!isConversationStarted ? (
          <div className="absolute left-1/2 top-[136px] flex w-[212px] -translate-x-1/2 flex-col items-center gap-8 max-[360px]:w-[198px]">
            <h1 className="min-w-full text-center text-[30px] font-semibold leading-[1.2] tracking-[-1px]">
              <span className="block text-[#182a17]">Hello, Mario</span>
              <span className="block text-[#31674c]">How can I help?</span>
            </h1>
            <div className="flex w-[177px] flex-col items-start gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="min-h-[32px] w-full rounded-[100px] border border-black/10 bg-white px-4 py-3 text-center text-[14px] font-medium leading-5 text-[#333333] whitespace-nowrap"
              >
                Select plant (optional)
              </button>
              <p className="w-full text-center text-[12px] font-normal leading-4 text-[#333333cc]">
                Choose a plant for more
                <br />
                specific guidance.
              </p>
            </div>
          </div>
          ) : null}

          {!isConversationStarted ? (
          <div className="absolute left-0 top-[404px] flex w-full flex-col gap-4">
            <div className="px-4 pb-2">
              <div className="border-b border-black/5 pb-2">
                <p className="text-[14px] font-medium leading-5 text-[#333333]">Choose a topic (optional)</p>
              </div>
            </div>
            <div className="w-full overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="min-w-max">
                <div className="flex flex-col gap-[10px]">
                  {topicRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-[10px]">
                      {row.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            const selectedTopic = topicOptions.find((item) => item.label === topic);
                            if (!selectedTopic) return;
                            setSelectedTopicId(selectedTopic.id);
                            setIsTopicConfirmDrawerOpen(true);
                          }}
                          className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-3 text-[14px] font-medium leading-5 text-[#333333cc]"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          ) : null}

          {messages.length > 0 ? (
            <div className="absolute left-0 right-0 top-[88px] bottom-[96px] overflow-y-auto px-4 pb-4">
              <div className="flex flex-col gap-4 pt-4">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="ml-auto max-w-[80%] border border-[rgba(5,46,22,0.1)] bg-[#457941] p-4 text-white" style={{ borderTopLeftRadius: 100, borderTopRightRadius: 60, borderBottomLeftRadius: 100, borderBottomRightRadius: 1 }}>
                      <p className="text-[14px] font-medium leading-5">{message.content}</p>
                    </div>
                  ) : (
                    <div key={message.id} className="mr-auto w-[265px] rounded-br-[20px] rounded-tl-[20px] rounded-tr-[20px] border border-[#e5e5e5] bg-white p-4">
                      <p className="mb-1 text-[14px] font-bold leading-5 text-[#333333]">Care Plan</p>
                      <p className="text-[14px] font-medium leading-5 text-[#333333cc]">{message.content}</p>
                      <div className="mt-3 border-t border-black/10 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button type="button" className="rounded-lg p-1">
                              <Image src="/icons/chat-menus/copy.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                            </button>
                            <button type="button" className="rounded-lg p-1">
                              <Image src="/icons/chat-menus/refresh-cw.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveAsLog(message.id, message.content)}
                            disabled={Boolean(savingLogByMessageId[message.id] || savedLogByMessageId[message.id])}
                            className="rounded-full bg-[#f5f5f5] px-3 py-[6px] text-[12px] font-normal leading-4 text-[#333333]"
                          >
                            {savedLogByMessageId[message.id] ? "Saved" : savingLogByMessageId[message.id] ? "Saving..." : "Save as log"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}

          <div className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] left-4 right-4 z-10 flex items-center gap-3">
            <button
              type="button"
              aria-label="Add"
              onClick={() => {
                setIsPlusMenuOpen((v) => !v);
                setIsHeaderMenuOpen(false);
              }}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-black/10 bg-white p-2"
            >
              <PlusIcon />
            </button>
            <div className="flex h-[52px] min-w-0 flex-1 items-center justify-between rounded-full border border-black/10 bg-white px-4 py-2">
              <div className="flex min-h-[36px] min-w-0 flex-1 items-center px-2 py-1">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder="Send a message"
                  className="w-full bg-transparent text-[14px] font-medium leading-5 text-[#333333] placeholder:text-[#33333380] outline-none"
                />
              </div>
              <button
                type="button"
                aria-label="Send"
                onClick={handleSend}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0fdf4]"
              >
                <ArrowUpIcon />
              </button>
            </div>
          </div>

          {isPlusMenuOpen ? (
            <div className="absolute left-4 top-[588px] z-40 w-[238px] rounded-[8px] border border-[#e5e5e5] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              <button type="button" className="flex min-h-[36px] w-full items-center gap-2 px-3 py-3 text-left">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fafafa] p-[6px]">
                  <Image src="/icons/chat-menus/add-photos.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <span className="text-[14px] font-normal leading-5 text-[#333333]">Add photos/files</span>
              </button>
              <button type="button" className="flex min-h-[36px] w-full items-center gap-2 px-3 py-3 text-left">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fafafa] p-[6px]">
                  <Image src="/icons/chat-menus/take-a-picture.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <span className="text-[14px] font-normal leading-5 text-[#333333]">Take a picture</span>
              </button>
              <button type="button" className="flex min-h-[36px] w-full items-center gap-2 px-3 py-3 text-left">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fafafa] p-[6px]">
                  <Image src="/icons/chat-menus/select-plant.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" />
                </span>
                <span className="text-[14px] font-normal leading-5 text-[#333333]">Select plant</span>
              </button>
            </div>
          ) : null}

          <div
            className={`absolute bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
              isRenameDrawerOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
            <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
              <div className="flex w-full flex-col items-center gap-6 py-5">
                <h3 className="w-[266px] text-center text-[20px] font-semibold leading-6 text-[#182a17]">Edit conversation name</h3>
                <div className="w-full">
                  <div className="rounded-[8px] border border-black/5 bg-white px-4 py-3">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#0a0a0a] outline-none"
                    />
                  </div>
                  <p className="mt-2 text-[12px] font-normal leading-4 text-[#333333cc]">At least X characters</p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={renameValue.trim().length < 3}
                  onClick={async () => {
                    if (renameValue.trim().length < 3) return;
                    const nextTitle = renameValue.trim();
                    try {
                      if (conversationId) {
                        await fetch(`/api/my-grow-mate/conversations/${conversationId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ title: nextTitle }),
                        });
                      }
                      if (attachedTopicLabel !== "None Selected") {
                        setAttachedTopicLabel(nextTitle);
                      } else if (attachedPlantName !== "None Selected") {
                        setAttachedPlantName(nextTitle);
                      }
                    } finally {
                      setConversationName(nextTitle);
                      setIsRenameDrawerOpen(false);
                    }
                  }}
                  className={`h-[52px] w-full rounded-[1000px] px-6 text-center text-[14px] font-medium leading-5 text-[#fafafa] ${
                    renameValue.trim().length < 3 ? "bg-[#457941] opacity-50" : "bg-[#457941] opacity-100"
                  }`}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenameDrawerOpen(false)}
                  className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#333333]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
              isDeleteDrawerOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
            <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
              <div className="flex flex-col items-center gap-4 px-4 py-5">
                <h3 className="w-[266px] text-center text-[20px] font-semibold leading-6 text-[#182a17]">Delete chat?</h3>
                <p className="w-full text-center text-[14px] font-medium leading-5 text-[#333333cc]">This action cannot be undone.</p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDrawerOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="h-[52px] w-full rounded-[100px] bg-[#ef4444] px-6 text-center text-[14px] font-medium leading-5 text-white"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteDrawerOpen(false)}
                  className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#333333]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {isDeleteModalOpen ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
              <div className="w-full max-w-[320px] rounded-[12px] border border-[#e5e5e5] bg-[#f8f6f1] p-8 shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col gap-4 text-center">
                  <h3 className="text-[20px] font-semibold leading-6 text-[#182a17]">Delete chat?</h3>
                  <p className="text-[14px] font-medium leading-5 text-[#333333cc]">This action cannot be undone.</p>
                </div>
                <div className="mt-8 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (conversationId) {
                          await fetch(`/api/my-grow-mate/conversations/${conversationId}`, { method: "DELETE" });
                        }
                      } finally {
                        setMessages([]);
                        setMessageText("");
                        setConversationId(null);
                        setIsConversationStarted(false);
                        setAttachedPlantId(null);
                        setAttachedPlantName("None Selected");
                        setAttachedTopicLabel("None Selected");
                        setIsDeleteModalOpen(false);
                        setIsDeleteDrawerOpen(false);
                        setIsHeaderMenuOpen(false);
                        setIsPlusMenuOpen(false);
                        router.push("/my-grow-mate");
                      }
                    }}
                    className="min-h-[36px] w-full rounded-[100px] bg-[#ef4444] px-4 py-2 text-[14px] font-medium leading-5 text-white"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="min-h-[36px] w-full rounded-[100px] bg-white px-4 py-2 text-[14px] font-medium leading-5 text-[#0a0a0a]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isDrawerOpen ? <button type="button" aria-label="Close drawer" onClick={() => setIsDrawerOpen(false)} className="absolute inset-0 z-30 bg-[rgba(23,23,23,0.5)]" /> : null}

          <div
            className={`absolute bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
              isDrawerOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(0,0,0,0.1)]" />
            <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
              <h2 className="text-center text-[20px] font-semibold leading-6 text-[#182a17]">Select plant</h2>

              <div className="mt-6 rounded-full border border-black/5 bg-white px-3 py-2">
                <div className="flex min-h-[32px] items-center gap-3 rounded-lg px-2">
                  <SearchIcon />
                  <input
                    type="text"
                    value={plantSearch}
                    onChange={(event) => setPlantSearch(event.target.value)}
                    placeholder="Search for a specific plant"
                    className="w-full bg-transparent text-[14px] font-normal leading-5 text-[#333333] placeholder:text-[#33333380] outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex w-full overflow-hidden rounded-full border border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setSelectedPlantId(null);
                  }}
                  className={`h-10 flex-1 text-[14px] font-medium leading-5 ${activeTab === "all" ? "bg-[#457941] text-white" : "bg-white text-[#333333cc]"}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("identified");
                    setSelectedPlantId(null);
                  }}
                  className={`h-10 flex-1 text-[14px] font-medium leading-5 ${activeTab === "identified" ? "bg-[#457941] text-white" : "bg-white text-[#333333cc]"}`}
                >
                  Identified
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("unidentified");
                    setSelectedPlantId(null);
                  }}
                  className={`h-10 flex-1 text-[14px] font-medium leading-5 ${activeTab === "unidentified" ? "bg-[#457941] text-white" : "bg-white text-[#333333cc]"}`}
                >
                  Unidentified
                </button>
              </div>

              <div className="mt-6 max-h-[min(44vh,370px)] overflow-y-auto border-y border-black/10 bg-[#f8f6f1] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {activePlants.map((plant, idx) => {
                  const isSelected = selectedPlantId === plant.id;
                  return (
                  <button
                    key={plant.id}
                    type="button"
                    onClick={() => setSelectedPlantId(plant.id)}
                    className={`flex w-full items-center gap-4 px-3 py-3 text-left ${idx < activePlants.length - 1 ? "border-b border-black/10" : ""}`}
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[6px] bg-[#d9d9d9]">
                      <img src={plant.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium leading-5 text-[#333333]">{plant.name}</p>
                      <p className="mt-[2px] text-[12px] font-normal leading-4 text-[#333333cc]">{plant.species}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#2f6b3a] bg-[#457941]" : "border-black/10 bg-[#f2f2f2]"}`}
                    >
                      {isSelected ? (
                        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3 w-3 text-white">
                          <path
                            d="M5 10.2L8.2 13.4L15 6.6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                )})}
                {activePlants.length === 0 ? (
                  <div className="px-3 py-6 text-center text-[12px] font-medium text-[#737373]">No plants found.</div>
                ) : null}
              </div>

              <button
                type="button"
                disabled={selectedPlantId === null}
                onClick={() => {
                  if (selectedPlantId !== null) {
                    setIsDrawerOpen(false);
                    setIsConfirmDrawerOpen(true);
                  }
                }}
                className={`mt-6 h-[52px] w-full rounded-full text-[14px] font-medium leading-5 text-[#fafafa] ${
                  selectedPlantId === null ? "bg-[#457941] opacity-50" : "bg-[#457941] opacity-100"
                }`}
              >
                Attach plant
              </button>
            </div>
          </div>

          {isConfirmDrawerOpen ? <button type="button" aria-label="Close confirmation drawer" onClick={() => setIsConfirmDrawerOpen(false)} className="absolute inset-0 z-30 bg-[rgba(23,23,23,0.5)]" /> : null}

          <div
            className={`absolute bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
              isConfirmDrawerOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(212,212,212,0.5)]" />
            <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
              <div className="flex flex-col items-center gap-4 px-4 py-5">
                <h3 className="w-[266px] text-center text-[20px] font-semibold leading-6 tracking-[0] text-[#182a17]">
                  Switching plants will start a new conversation.
                </h3>
                <p className="w-full text-center text-[14px] font-medium leading-5 text-[#333333cc]">
                  Your current chat will remain saved.
                </p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPlant) {
                      setAttachedPlantId(selectedPlant.id);
                      setAttachedPlantName(selectedPlant.name);
                      setAttachedTopicLabel("None Selected");
                    }
                    setMessages([]);
                    setMessageText("");
                    setIsConversationStarted(true);
                    setConversationId(null);
                    setIsConfirmDrawerOpen(false);
                    setSelectedPlantId(null);
                  }}
                  className="h-[52px] w-full rounded-[1000px] bg-[#457941] px-6 text-center text-[14px] font-medium leading-5 text-[#fafafa]"
                >
                  Start new conversation
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmDrawerOpen(false)}
                  className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {isTopicConfirmDrawerOpen ? <button type="button" aria-label="Close topic confirmation drawer" onClick={() => setIsTopicConfirmDrawerOpen(false)} className="absolute inset-0 z-30 bg-[rgba(23,23,23,0.5)]" /> : null}

          <div
            className={`absolute bottom-0 left-0 right-0 z-40 w-full rounded-tl-[24px] rounded-tr-[24px] border border-[rgba(212,212,212,0.5)] bg-[#f8f6f1] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${
              isTopicConfirmDrawerOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="mx-auto mt-[7px] h-[3px] w-20 rounded-[2px] bg-[rgba(212,212,212,0.5)]" />
            <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-6">
              <div className="flex flex-col items-center gap-4 px-4 py-5">
                <h3 className="w-[266px] text-center text-[20px] font-semibold leading-6 tracking-[0] text-[#182a17]">
                  Switching topics will start a new conversation.
                </h3>
                <p className="w-full text-center text-[14px] font-medium leading-5 text-[#333333cc]">
                  Your current chat will remain saved.
                </p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const topic = topicOptions.find((item) => item.id === selectedTopicId);
                    if (topic) {
                      setAttachedTopicLabel(topic.label);
                      const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: topic.label };
                      const assistantMessage: ChatMessage = {
                        id: `a-${Date.now() + 1}`,
                        role: "assistant",
                        content: DEMO_ASSISTANT_BODY,
                      };
                      setMessages([userMessage]);
                      setConversationId(null);
                      setTimeout(() => {
                        setMessages((prev) => [...prev, assistantMessage]);
                        // per-bubble save state handled by message id
                      }, 700);
                      void persistMessage(topic.label, DEMO_ASSISTANT_BODY, topic.label);
                    }
                    setMessageText("");
                    setIsConversationStarted(true);
                    setIsTopicConfirmDrawerOpen(false);
                    setSelectedTopicId(null);
                  }}
                  className="h-[52px] w-full rounded-[1000px] bg-[#457941] px-6 text-center text-[14px] font-medium leading-5 text-[#fafafa]"
                >
                  Start new conversation
                </button>
                <button
                  type="button"
                  onClick={() => setIsTopicConfirmDrawerOpen(false)}
                  className="h-[52px] w-full rounded-[100px] bg-white px-6 text-center text-[14px] font-medium leading-5 text-[#171717]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function MyGrowMateChatPage() {
  return (
    <Suspense
      fallback={
        <main className="client-main h-dvh w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] text-[#182a17]">
          <section className="client-shell mx-auto flex h-dvh w-full max-w-[390px] items-center justify-center overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
            <p className="text-[14px] text-[#525252]">Loading...</p>
          </section>
        </main>
      }
    >
      <MyGrowMateChatPageContent />
    </Suspense>
  );
}
