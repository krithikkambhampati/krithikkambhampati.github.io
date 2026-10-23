void sigint_handler(int sig) {
    (void)sig;
    if (current_fg_pgid > 0) {
        // Send SIGINT to the foreground process group
        kill(-current_fg_pgid, SIGINT);
    } else {
        // No foreground process, set flag and write newline
        sigint_received = 1;
        write(STDOUT_FILENO, "\n", 1);
    }
}
void sigtstp_handler(int sig) {
    (void)sig;
    
    if (current_fg_pgid > 0) {
        kill(-current_fg_pgid, SIGTSTP);


        if (isatty(STDIN_FILENO)) {
            tcsetpgrp(STDIN_FILENO, getpgrp());
        }

        sigtstp_received = 1;
    } else {
        sigtstp_received = 1;
        write(STDOUT_FILENO, "\n", 1);
    }
}
// ...
    // Set up SIGINT handler - NO SA_RESTART so it interrupts read()
    sa_int.sa_handler = sigint_handler;
    sigemptyset(&sa_int.sa_mask);
    sa_int.sa_flags = 0;  // No SA_RESTART - we want to interrupt system calls
    sigaction(SIGINT, &sa_int, NULL);
