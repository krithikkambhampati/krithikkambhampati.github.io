        if (pids[i] == 0)
        {
            // Child process - set up pipes
            if (i > 0)
            {
                dup2(pipes[i - 1][0], STDIN_FILENO);
                close(pipes[i - 1][0]);
                close(pipes[i - 1][1]);
            }
            if (i < pipe_count)
            {
                dup2(pipes[i][1], STDOUT_FILENO);
                close(pipes[i][0]);
                close(pipes[i][1]);
            }
            for (int k = 0; k < pipe_count; k++)
            {
                if (k != i && k != i - 1)
                {
                    close(pipes[k][0]);
                    close(pipes[k][1]);
                }
            }

            // Handle redirection for this command
            if (input_file)
            {
                int fd = open(input_file, O_RDONLY);
                // ...
                dup2(fd, STDIN_FILENO);
                close(fd);
            }
            if (output_file)
            {
                int flags = O_WRONLY | O_CREAT | (output_append ? O_APPEND : O_TRUNC);
                int fd = open(output_file, flags, 0644);
                // ...
                dup2(fd, STDOUT_FILENO);
                close(fd);
            }
