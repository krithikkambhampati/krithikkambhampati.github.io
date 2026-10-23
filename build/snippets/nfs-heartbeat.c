#define HEARTBEAT_INTERVAL 5    // Check every 5 seconds
#define HEARTBEAT_TIMEOUT 15000 // 15 seconds timeout in milliseconds
// ...
    while (monitoring_active) {
        sleep(HEARTBEAT_INTERVAL);
        
        pthread_rwlock_rdlock(&ss_lock);
        StorageServer* current = ss_list_head;
        
        while (current) {
            if (current->is_active) {
                long long now = get_current_time_ms();
                long long time_since_heartbeat = now - current->last_heartbeat;
                
                if (time_since_heartbeat > HEARTBEAT_TIMEOUT) {
                    pthread_rwlock_unlock(&ss_lock);
                    
                    // Mark as inactive
                    mark_storage_server_inactive(current->id);
                    // ...
                    pthread_rwlock_rdlock(&ss_lock);
                }
            }
            current = current->next;
        }
        
        pthread_rwlock_unlock(&ss_lock);
    }
