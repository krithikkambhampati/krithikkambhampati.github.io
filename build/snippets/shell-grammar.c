static int parse_cmd_group(TokenList* list) {
    if (!parse_atomic(list)) {
        return 0;
    }
    while (list->pos < list->count && strcmp(list->tokens[list->pos], "|") == 0) {
        list->pos++;
        if (!parse_atomic(list)) {
            return 0;
        }
    }
    return 1;
}

static int parse_shell_cmd_tokens(TokenList* list) {
    if (list->pos >= list->count) {
        return 1; // Empty input is valid
    }
    // First cmd_group
    if (!parse_cmd_group(list)) {
        return 0;
    }

    // Zero or more: (& | ;) cmd_group
    while (list->pos < list->count) {
        if (strcmp(list->tokens[list->pos], ";") == 0) {
            // Semicolon MUST be followed by a cmd_group
            list->pos++;
            if (!parse_cmd_group(list)) {
                return 0; // reject if nothing valid after ;
            }
        } else if (strcmp(list->tokens[list->pos], "&") == 0) {
            // Check if this is the final optional &
            if (list->pos + 1 == list->count) {
                list->pos++;
                return 1; // trailing & is fine
            }
            // ...
        } else {
            break;
        }
    }

    return 1;
}
