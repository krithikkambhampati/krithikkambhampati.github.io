    // Try primary storage server first
    StorageServer* ss = get_storage_server(metadata->storage_server_id);
    
    // FAULT TOLERANCE: If primary SS is down, try replicas
    if (!ss || !ss->is_active) {
        // ...
        // Get replica SS IDs
        int replica_ids[2];
        int num_replicas = get_file_replicas(msg->filename, replica_ids, 2);
        
        bool found_replica = false;
        for (int i = 0; i < num_replicas; i++) {
            ss = get_storage_server(replica_ids[i]);
            if (ss && ss->is_active) {
                log_message(LOG_LEVEL_INFO, "Using replica SS %d for file %s", ss->id, msg->filename);
                printf("[FAILOVER] Using replica SS %d for '%s'\n", ss->id, msg->filename);
                found_replica = true;
                break;
            }
        }
        // ...
    }
    
    // Return SS info to client
    SSInfoMsg ss_info;
    strncpy(ss_info.ss_ip, ss->ip, 15);
    ss_info.client_port = ss->client_port;
    
    send_message(client->sockfd, MSG_SS_INFO, &ss_info, sizeof(ss_info));
