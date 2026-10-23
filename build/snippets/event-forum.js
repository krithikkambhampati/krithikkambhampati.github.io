    const fetchMessages = async () => {
        try {
            const { ok, data } = await discussionAPI.getMessages(eventId);
            if (ok) {
                const newMessages = data.messages || [];
                const prevMessages = messagesRef.current;
                if (prevMessages.length > 0) {
                    const existingIds = new Set(prevMessages.map(m => m._id));
                    const newlyAdded = newMessages.filter(m => !existingIds.has(m._id));
                    const hasNewEveryone = newlyAdded.some(m =>
                        m.senderRole === "Organizer" && m.content.includes("@everyone")
                    );

                    if (hasNewEveryone && (!user || user.role !== "ORGANIZER")) {
                        setEveryoneAlert("An Organizer has tagged @everyone in a new message!");
                        setTimeout(() => setEveryoneAlert(""), 10000);
                    }
                }
                messagesRef.current = newMessages;
                setMessages(newMessages);
            }
        // ...
    useEffect(() => {
        fetchMessages();
        // Poll every 5 seconds for new messages
        pollRef.current = setInterval(fetchMessages, 5000);
        return () => clearInterval(pollRef.current);
    }, [eventId]);
