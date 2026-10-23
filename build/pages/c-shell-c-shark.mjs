// C-Shell and C-Shark. C-Shell is an Operating Systems and Networks
// assignment; C-Shark's repo says only "for educational purposes".

import { html, esc } from "../lib/html.mjs";
import { intro, sec, field, codePane, prose, points, decisions, stack } from "../lib/parts.mjs";
import { FRAMES, snippet } from "../frames.mjs";

// The hero: the two programs side by side, each as it presents itself.
const heroPair = (root) => `<div class="tools-hero">
  <figure class="pane term" data-ui>
    <figcaption class="pane-bar"><span class="file">C-Shell</span><span class="spacer"></span><span>the grammar it parses</span></figcaption>
    ${FRAMES["sh-term"].body(root)}
  </figure>
  <figure class="pane" data-ui>
    <figcaption class="pane-bar"><span class="file">C-Shark</span><span class="spacer"></span><span>what it reads in a frame</span></figcaption>
    <div class="tools-layers">${FRAMES["shark-layers"].body(root)}</div>
  </figure>
</div>`;

const readmeOut = `<figure class="pane term" data-reveal data-ui>
  <figcaption class="pane-bar"><span class="file">C-Shark README</span><span class="spacer"></span><span>example session</span></figcaption>
  <pre class="code"><code>[[OUT]]</code></pre>
  <p class="code-note">The README's example of a session. The menu matches the program exactly; the code prints each packet in a slightly different layout, layer by layer as L2, L3, L4 and L7.</p>
</figure>`;

export default function ({ root, project }) {
  const body = html`
${intro({
  project,
  kicker: "",
  lede: "A shell and a packet sniffer, both written to understand what sits under everyday tools. C&#8209;Shell parses commands, wires pipes and runs jobs in the foreground and background. C&#8209;Shark captures live traffic and decodes every packet by hand, byte by byte.",
  meta: [
    ["C-Shell", "Operating Systems and Networks coursework. C99 and POSIX 2008, compiled with -Werror."],
    ["C-Shark", "libpcap for capture; every header field parsed from raw bytes"],
    ["Built with", "C, POSIX system calls, libpcap"],
  ],
  visual: heroPair(root),
})}

${sec({ title: "C-Shell: a grammar first", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "The prompt shows your user, host and directory, with the shell's starting directory as home. Input is tokenised on whitespace and on the operators | & ; &lt; &gt; and &gt;&gt;, even without spaces around them, and then checked by a small recursive-descent parser before anything runs.",
        "A pipe binds tighter than ; and &amp;, and a trailing &amp; sends the whole line to the background. Anything that doesn't fit prints Invalid Syntax! and runs nothing."
      )}
      ${points([
        "Built-ins: hop to change directory, with ~ and -; reveal to list files; log for the last 15 commands; activities, ping, fg and bg for jobs.",
        "Built-ins work inside pipelines too. There they run in a forked child, so hop in a pipeline doesn't move the shell itself.",
      ])}
    </div>
    ${codePane({ file: "src/parser.c", name: "shell-grammar.c", start: 190 })}
  </div>
` })}

${sec({ title: "Pipes, one child per stage", body: html`
  <div class="p-split">
    ${codePane({ file: "src/pipeline.c", name: "shell-pipe.c", start: 158, note: "Each stage reads from the pipe before it and writes to the pipe after it, closes every other end, then applies its own redirection." })}
    <div>
      ${prose(
        "For a pipeline of n commands the shell makes n − 1 pipes and forks n children. Every child closes the pipe ends it doesn't use, otherwise a reader would never see end of file. The parent closes all of them and waits for each child.",
        "Redirection layers on top per stage, so <span class=\"mono\">sort &lt; in.txt | uniq &gt;&gt; out.txt</span> opens files in the stages that need them."
      )}
    </div>
  </div>
` })}

${sec({ title: "Ctrl-C reaches the job, not the shell", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "Every job runs in its own process group, and the shell hands the terminal to the foreground group. Both parent and child set the group, so it doesn't matter which runs first.",
        "The handlers for Ctrl-C and Ctrl-Z forward the signal to the foreground group. They're installed without SA_RESTART on purpose, so the signal also interrupts the shell's own blocking read at the prompt. Ctrl-Z prints the job as stopped and adds it to the list; fg and bg send it SIGCONT. Ctrl-D logs out and kills every tracked job."
      )}
    </div>
    ${codePane({ file: "src/signals.c", name: "shell-signals.c", start: 37, note: "Forward to the foreground group, and don't restart interrupted calls." })}
  </div>
` })}

${field(html`
${sec({ title: "C-Shark: reading a packet by hand", body: html`
  <div class="p-split">
    <div>
      ${prose(
        "C-Shark lists the machine's interfaces, captures in promiscuous mode with libpcap, and prints every packet as it arrives: Ethernet, then IPv4, IPv6 or ARP, then TCP or UDP with its flags spelled out, then a guess at the application from the port, with the first 64 bytes of payload as hex.",
        "libpcap only delivers bytes. Every field after that is pulled out by hand with shifts, like the EtherType from bytes 12 and 13. Ctrl-C breaks out of the capture loop and returns to the menu instead of killing the program."
      )}
    </div>
    ${codePane({ file: "src/sniffer.c", name: "shark-tcp.c", start: 76, note: "TCP decoded from raw bytes, big-endian, with the flag bits named." })}
  </div>
` })}
`)}

${sec({ title: "Sessions you can take apart", body: html`
  <div class="p-split">
    ${codePane({ file: "src/sniffer.c", name: "shark-handler.c", start: 175, note: "Each packet is printed layer by layer, then a copy is kept for inspection." })}
    <div>
      ${points([
        "Up to 10,000 packets from a capture are kept in memory, each copied with its pcap header.",
        "Inspecting one shows a hex dump of the whole frame, then every field labelled with the bytes it came from: source MAC from bytes 6 to 11, TTL from byte 22, source IP from 26 to 29.",
        "Filter mode offers six presets compiled into BPF: HTTP, HTTPS, DNS, ARP, TCP and UDP.",
      ])}
      ${codePane({ file: "src/sniffer.c", name: "shark-filter.c", from: 1, to: 6, start: 35 })}
    </div>
  </div>
  ${readmeOut}
` })}

${sec({ title: "Limits, stated plainly", body: decisions([
  ["Application guesses come from ports", "Port 80 is HTTP, 443 is HTTPS and 53 is DNS. Nothing looks inside the payload to confirm it.", "src/sniffer.c, README"],
  ["Six filters, not free text", "Filters are the six presets. Typing your own BPF expression isn't supported.", "src/sniffer.c"],
  ["IPv6 extension headers aren't walked", "The decoder assumes the transport header starts right after the 40-byte IPv6 header.", "src/ipv6.c"],
  ["The shell has no quoting", "The tokenizer doesn't understand quotes, so an argument with spaces in it can't be passed.", "src/parser.c"],
]) })}

${sec({ title: "Built with", body: stack([
  ["C-Shell", "C99, POSIX 2008: fork, execvp, pipe, dup2, setpgid, tcsetpgrp, sigaction"],
  ["C-Shark", "C, libpcap: pcap_open_live, pcap_compile, pcap_setfilter, pcap_loop"],
  ["Build", "make, gcc with -Wall -Wextra"],
]) })}
`;
  return { body: body.replace("[[OUT]]", readmeLines()), titleSuffix: "a Unix shell and a packet sniffer in C" };
}

function readmeLines() {
  return snippet("shark-readme.txt").replace(/\s+$/, "").split("\n").map((l) => `<span class="ln">${esc(l) || " "}</span>`).join("");
}
