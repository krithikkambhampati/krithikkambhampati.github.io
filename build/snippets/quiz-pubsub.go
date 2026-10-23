func (r *room) subscribeLoop() {
	pubsub := r.rdb.Subscribe(ctx, roomChannel(r.code))
	defer pubsub.Close()

	ch := pubsub.Channel()
	for redisMsg := range ch {
		var msg wsMessage
		if err := json.Unmarshal([]byte(redisMsg.Payload), &msg); err != nil {
			log.Println("subscribeLoop: unmarshal error:", err)
			continue
		}
		r.localBroadcast(msg)
	}
}

// broadcast publishes a message to the room's Redis channel so it reaches
// every server instance with players in this room, not just this process.
// Callers (game_loop.go, handleWS) should always use this, never
// localBroadcast directly - localBroadcast is only for the subscriber loop.
func (r *room) broadcast(msg wsMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Println("broadcast: marshal error:", err)
		return
	}
	if err := r.rdb.Publish(ctx, roomChannel(r.code), data).Err(); err != nil {
		log.Println("broadcast: redis publish error, falling back to local-only:", err)
		// If Redis is briefly unreachable, still deliver to players on this
		// instance rather than silently dropping the message everywhere.
		r.localBroadcast(msg)
	}
}
