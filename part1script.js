// ============================================================
// PART 1: Python OOP + Big O + Stacks
// Python source for Pyodide.
// ============================================================

window.topicTemplates = window.topicTemplates || {};

window.topicTemplates[1] = {
    title: "Python OOP + Big O + Stacks",
    code: String.raw`# Topic 1: Python OOP + Big O + Stacks
# Action History Stack + Shovel System
# Undo is intentionally removed.
# A shovel removes/replaces a plant but NEVER refunds its purchase cost.

class ActionHistoryStack:
    def __init__(self):
        self.stack = []

    def push_action(self, action_string):
        self.stack.append(action_string)
        pushAction(action_string)

    def pop_action(self):
        if self.stack:
            return self.stack.pop()
        return None

    def peek(self):
        if self.stack:
            return self.stack[-1]
        return None

    def is_empty(self):
        return len(self.stack) == 0

stack = ActionHistoryStack()

print("Action History Stack")
print("Purpose: record garden actions using LIFO.")
print("Undo/refund is disabled.")
print("Shovel removes a plant without returning its spent coins.")
print("Peek:", stack.peek())
print("Pop:", stack.pop_action())
print("Is empty:", stack.is_empty())
print("Action History Stack ready!")
`
};
