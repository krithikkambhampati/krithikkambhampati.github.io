	const maxRetries = 20
	for i := 0; i < maxRetries; i++ {
		err := rdb.Watch(ctx, func(tx *redis.Tx) error {
			data, err := tx.Get(ctx, gameKey(code)).Bytes()
			// ...
			var g Game
			if err := json.Unmarshal(data, &g); err != nil {
				return err
			}
			if g.Status != "lobby" {
				return errors.New("game already started")
			}
			g.Players = append(g.Players, p)
			data, err = encodeGame(&g)
			// ...
			_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Set(ctx, gameKey(g.Code), data, 6*time.Hour)
				return nil
			})
			// ...
		}, gameKey(code))
		if err == nil {
			return saved, &p, nil
		}
		if !errors.Is(err, redis.TxFailedErr) {
			return nil, nil, err
		}
		// Contention: back off briefly with jitter before retrying,
		// instead of hammering WATCH again immediately.
		backoff := time.Duration(rand.Intn(20)+5) * time.Millisecond
		time.Sleep(backoff)
	}
	return nil, nil, errors.New("failed to join game: too much contention")
