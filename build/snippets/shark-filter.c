void handle_sigint(int sig) {
    (void)sig; 
    if (current_handle) {
        pcap_breakloop(current_handle);
    }
}
// ...
    handle = pcap_open_live(dev_name, 65535, 1, 1000, errbuf);
    // ...
    if (pcap_compile(handle, &fp, filter_exp, 0, net) == -1) {
        fprintf(stderr, "Error compiling filter: %s\n", pcap_geterr(handle));
        pcap_close(handle);
        return;
    }

    if (pcap_setfilter(handle, &fp) == -1) {
        fprintf(stderr, "Error setting filter: %s\n", pcap_geterr(handle));
        pcap_freecode(&fp);
        pcap_close(handle);
        return;
    }

    printf("[C-Shark] Sniffing on interface '%s' with filter '%s'. Press Ctrl+C to stop...\n", dev_name, filter_exp);
    current_handle = handle;
    pcap_loop(handle, -1, packet_handler, NULL);
    current_handle = NULL;

    pcap_freecode(&fp);
    pcap_close(handle);
