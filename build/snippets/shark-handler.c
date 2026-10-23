void packet_handler(u_char *user, const struct pcap_pkthdr *pkthdr, const u_char *packet) {
    (void)user;
    printf("-----------------------------------------\n");
    printf("Packet #%d | ", packet_count++);
    printf("Timestamp: %ld.%06ld | Length: %d bytes\n", 
           pkthdr->ts.tv_sec, (long)pkthdr->ts.tv_usec, pkthdr->caplen);
    
    const u_char *dst_mac = &packet[0];   // first 6 bytes
    const u_char *src_mac = &packet[6]; 

    uint16_t ethertype = (packet[12] << 8) | packet[13];  // bytes 12-13 combined as big-endian

    printf("L2 (Ethernet): ");
    printf("Dst MAC: "); print_mac(dst_mac); printf(" | ");
    printf("Src MAC: "); print_mac(src_mac); printf(" |");
    // ...
    handle_l3(ethertype, packet);
