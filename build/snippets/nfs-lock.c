int lock_sentence(const char* filename, int sentence_index, const char* username) {
    pthread_mutex_lock(&list_mutex);
    
    SentenceLock* lock = find_or_create_lock(filename, sentence_index);
    
    if (lock->is_locked) {
        pthread_mutex_unlock(&list_mutex);
        log_message(LOG_LEVEL_WARNING, "Sentence %d in %s already locked by %s",
                   sentence_index, filename, lock->locked_by);
        return -1;
    }
    
    lock->is_locked = true;
    strncpy(lock->locked_by, username, sizeof(lock->locked_by) - 1);
    
    pthread_mutex_unlock(&list_mutex);
    
    log_message(LOG_LEVEL_INFO, "Locked sentence %d in %s for %s",
               sentence_index, filename, username);
    return 0;
}
