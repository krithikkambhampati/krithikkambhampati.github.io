// Message header structure
typedef struct {
    MessageType type;
    uint32_t length;
    uint32_t error_code;
} MessageHeader;

int send_message(int sockfd, MessageType type, const void* data, uint32_t length) {
    MessageHeader header;
    header.type = type;
    header.length = length;
    header.error_code = 0;
    
    if (send_data(sockfd, &header, sizeof(header)) < 0) {
        return -1;
    }
    
    if (length > 0 && data != NULL) {
        if (send_data(sockfd, data, length) < 0) {
            return -1;
        }
    }
    
    return 0;
}
