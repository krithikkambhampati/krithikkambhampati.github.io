    if (protocol == 6) {  // TCP
        unsigned short src_port = (segment[0] << 8) | segment[1];
        unsigned short dst_port = (segment[2] << 8) | segment[3];
        unsigned int seq = (segment[4] << 24) | (segment[5] << 16) | (segment[6] << 8) | segment[7];
        unsigned int ack = (segment[8] << 24) | (segment[9] << 16) | (segment[10] << 8) | segment[11];
        unsigned char offset_reserved = segment[12];
        unsigned char flags = segment[13];
        unsigned short window = (segment[14] << 8) | segment[15];
        unsigned short checksum = (segment[16] << 8) | segment[17];

        unsigned int header_len = ((offset_reserved >> 4) & 0xF) * 4;
        // ...
        printf("| Seq: %u | Ack: %u | Flags: [", seq, ack);
        
        int first_flag = 1;
        if (flags & 0x02) { printf("%sSYN", first_flag ? "" : ","); first_flag = 0; }
        if (flags & 0x10) { printf("%sACK", first_flag ? "" : ","); first_flag = 0; }
        if (flags & 0x01) { printf("%sFIN", first_flag ? "" : ","); first_flag = 0; }
        if (flags & 0x04) { printf("%sRST", first_flag ? "" : ","); first_flag = 0; }
        if (flags & 0x08) { printf("%sPSH", first_flag ? "" : ","); first_flag = 0; }
        if (flags & 0x20) { printf("%sURG", first_flag ? "" : ","); first_flag = 0; }
        printf("]\nWindow: %u | Checksum: 0x%04X | Header Length: %u bytes\n", window, checksum, header_len);

        int payload_len = l3_payload_len - header_len;
        if (payload_len > 0) {
            handle_l7(segment + header_len, payload_len, src_port, dst_port);
        }
