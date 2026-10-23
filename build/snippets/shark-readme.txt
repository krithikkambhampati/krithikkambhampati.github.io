[C-Shark] The Command-Line Packet Predator
==============================================
[C-Shark] Searching for available interfaces... Found!
 1. eth0 (Ethernet)
 2. wlan0 (Wireless)
 3. lo (Loopback)

Select an interface to sniff (1-3): 1

[C-Shark] Interface 'eth0' selected. What's next?

1. Start Sniffing (All Packets)
2. Start Sniffing (With Filters)
3. Inspect Last Session
4. Exit C-Shark

Enter choice (1-4): 1

========================================
Packet #1 | Length: 74 bytes | Timestamp: 2026-01-17 15:23:45
========================================
EtherType: IPv4 (0x0800)
Src MAC: aa:bb:cc:dd:ee:ff | Dst MAC: 11:22:33:44:55:66
Src IP: 192.168.1.100 | Dst IP: 142.250.185.46 | Protocol: TCP (6)
TTL: 64
ID: 0x4A2F | Total Length: 60 | Header Length: 20 bytes
Src Port: 54321 | Dst Port: 443 (HTTPS) | Seq: 1234567890 | Ack: 987654321
Flags: [SYN, ACK] | Window Size: 65535
