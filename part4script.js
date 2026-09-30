// ============================================================
// PART 4: Hierarchical Trees & Traversals
// Python source for Pyodide.
// ============================================================

window.topicTemplates = window.topicTemplates || {};

window.topicTemplates[4] = {
    title: "Hierarchical Trees & Traversals",
    code: String.raw`# Topic 4: Hierarchical Trees & Traversals
# Garden progression tree
# Level 1: Flowers
# Level 2: Fruits - unlock after selling 50 Level 1 crops
# Level 3: Vegetables - unlock after selling 50 Level 1 AND 25 Level 2 crops
# Higher levels have higher seed prices and higher selling income.

class GardenTreeNode:
    def __init__(self, name, level):
        self.name = name
        self.level = level
        self.children = []

    def add_child(self, child):
        self.children.append(child)

class GardenProgressionTree:
    def __init__(self):
        self.root = GardenTreeNode("Garden", 0)
        self.flowers = GardenTreeNode("Flowers", 1)
        self.fruits = GardenTreeNode("Fruits", 2)
        self.vegetables = GardenTreeNode("Vegetables", 3)
        self.root.add_child(self.flowers)
        self.flowers.add_child(self.fruits)
        self.fruits.add_child(self.vegetables)

    def preorder(self):
        result = []
        def visit(node):
            result.append(node.name)
            for child in node.children:
                visit(child)
        visit(self.root)
        return result

    def level_order(self):
        queue = [self.root]
        result = []
        while queue:
            node = queue.pop(0)
            result.append(node.name)
            queue.extend(node.children)
        return result

    def tree_text(self, level1_sold, level2_sold):
        level2_unlocked = level1_sold >= 50
        level3_unlocked = level1_sold >= 50 and level2_sold >= 25
        l2 = "UNLOCKED" if level2_unlocked else f"LOCKED - {level1_sold}/50 Level 1 sold"
        l3 = "UNLOCKED" if level3_unlocked else f"LOCKED - {level2_sold}/25 Level 2 sold"
        return (
            f"Garden\n"
            f"├── Flowers (Level 1) [UNLOCKED] - Sold: {level1_sold}/50\n"
            f"│   └── Fruits (Level 2) [{l2}] - Sold: {level2_sold}/25\n"
            f"│       └── Vegetables (Level 3) [{l3}]"
        )

progression_tree = GardenProgressionTree()

print("Garden Progression Tree ready!")
print("Preorder:", " -> ".join(progression_tree.preorder()))
print("Level-order:", " -> ".join(progression_tree.level_order()))
print("Goal: sell 50 Level 1 crops to unlock Level 2.")
print("Goal: sell 50 Level 1 and 25 Level 2 crops to unlock Level 3.")
`
};
