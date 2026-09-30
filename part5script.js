// ============================================================
// PART 5: Binary Search Tree (BST) & Node Mutation
// Connected to the existing Garden Simulator.
// ============================================================

window.topicTemplates = window.topicTemplates || {};

window.topicTemplates[5] = {
    title: "Binary Search Trees (BST) & Node Mutation",

    code: String.raw`
# ============================================================
# TOPIC 5: BINARY SEARCH TREE & NODE MUTATION
# ============================================================

class PlantNode:
    def __init__(
        self,
        key,
        part_type="stem",
        health=100,
        diseased=False,
        trait="normal"
    ):
        self.key = key
        self.part_type = part_type
        self.health = max(0, min(100, health))
        self.diseased = diseased
        self.trait = trait

        self.left = None
        self.right = None

    def __str__(self):
        disease = " | DISEASED" if self.diseased else ""

        return (
            f"{self.part_type} "
            f"(key={self.key}, "
            f"health={self.health}, "
            f"trait={self.trait}{disease})"
        )


class PlantBST:

    def __init__(self):
        self.root = None

    # --------------------------------------------------------
    # INSERT
    # --------------------------------------------------------

    def insert(
        self,
        key,
        part_type="stem",
        health=100,
        diseased=False,
        trait="normal"
    ):
        new_node = PlantNode(
            key,
            part_type,
            health,
            diseased,
            trait
        )

        if self.root is None:
            self.root = new_node
            return new_node

        current = self.root

        while True:

            if key < current.key:

                if current.left is None:
                    current.left = new_node
                    return new_node

                current = current.left

            else:

                if current.right is None:
                    current.right = new_node
                    return new_node

                current = current.right

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    def search(self, key):

        current = self.root

        while current is not None:

            if key == current.key:
                return current

            if key < current.key:
                current = current.left
            else:
                current = current.right

        return None

    # --------------------------------------------------------
    # INORDER TRAVERSAL
    # --------------------------------------------------------

    def inorder(self):

        result = []

        def walk(node):

            if node is None:
                return

            walk(node.left)
            result.append(node)
            walk(node.right)

        walk(self.root)

        return result

    # --------------------------------------------------------
    # COUNT
    # --------------------------------------------------------

    def count_nodes(self):
        return len(self.inorder())

    # --------------------------------------------------------
    # NODE MUTATION
    # --------------------------------------------------------

    def mutate_nodes(
        self,
        water=100,
        energy=100,
        care=100,
        rare_chance=0.15
    ):

        import random

        mutated = []

        for node in self.inorder():

            old_type = node.part_type
            old_health = node.health
            old_trait = node.trait
            old_disease = node.diseased

            # ------------------------------------------------
            # HEALTHY ENVIRONMENT
            # ------------------------------------------------

            if water >= 60 and energy >= 60 and care >= 60:

                node.health = min(
                    100,
                    node.health + 5
                )

                node.diseased = False

            # ------------------------------------------------
            # POOR ENVIRONMENT
            # ------------------------------------------------

            elif (
                water < 30
                or energy < 30
                or care < 30
            ):

                node.health = max(
                    0,
                    node.health - 15
                )

                if node.health < 40:
                    node.diseased = True

            # ------------------------------------------------
            # GROWTH MUTATION
            #
            # stem -> leaf
            # leaf -> flower
            # flower -> fruit
            # ------------------------------------------------

            if node.health >= 70 and not node.diseased:

                if node.part_type == "stem":
                    node.part_type = "leaf"

                elif node.part_type == "leaf":
                    node.part_type = "flower"

                elif node.part_type == "flower":
                    node.part_type = "fruit"

            # ------------------------------------------------
            # DISEASE MUTATION
            # ------------------------------------------------

            if node.diseased:

                if node.part_type == "stem":
                    node.part_type = "diseased_stem"

                elif node.part_type == "leaf":
                    node.part_type = "diseased_leaf"

                elif node.part_type == "flower":
                    node.part_type = "diseased_flower"

            # ------------------------------------------------
            # GOLDEN FRUIT MUTATION
            # ------------------------------------------------

            if (
                node.part_type == "fruit"
                and node.health >= 90
                and water >= 80
                and energy >= 80
                and care >= 80
                and random.random() < rare_chance
            ):

                node.trait = "golden"

            # ------------------------------------------------
            # RECORD MUTATION
            # ------------------------------------------------

            if (
                old_type != node.part_type
                or old_health != node.health
                or old_trait != node.trait
                or old_disease != node.diseased
            ):

                mutated.append(node)

        return mutated

    # --------------------------------------------------------
    # DISEASE SPREAD
    # --------------------------------------------------------

    def spread_disease(self):

        affected = []

        for node in self.inorder():

            if node.diseased:

                for child in (
                    node.left,
                    node.right
                ):

                    if (
                        child is not None
                        and not child.diseased
                    ):

                        child.diseased = True

                        child.health = max(
                            0,
                            child.health - 10
                        )

                        affected.append(child)

        return affected


# ============================================================
# BUILD BST FROM REAL GAME PLANT
# ============================================================

def build_plant_bst(plant_name, health):

    health = max(
        0,
        min(100, int(health))
    )

    tree = PlantBST()

    # Main plant stem.
    tree.insert(
        50,
        "stem",
        health
    )

    name = plant_name.lower()

    # Flower plants.
    if name in (
        "rose",
        "sampaguita",
        "sunflower"
    ):

        tree.insert(
            30,
            "leaf",
            health
        )

        tree.insert(
            70,
            "flower",
            health
        )

    # Fruit / vegetable plants.
    if name in (
        "apple",
        "strawberry",
        "watermelon",
        "mango",
        "tomato",
        "carrot",
        "eggplant",
        "corn",
        "sunflower"
    ):

        tree.insert(
            80,
            "fruit",
            health
        )

    return tree


# ============================================================
# EXPORT BST
# ============================================================

def export_tree(tree):

    return [

        {
            "key": node.key,
            "part_type": node.part_type,
            "health": node.health,
            "diseased": node.diseased,
            "trait": node.trait
        }

        for node in tree.inorder()
    ]


# ============================================================
# RUN PLANT SIMULATION
# ============================================================

def run_garden_plant_simulation(
    plant_name,
    health,
    water=100,
    energy=100,
    care=100,
    simulate_disease=False
):

    tree = build_plant_bst(
        plant_name,
        health
    )

    # Force disease for testing.
    if (
        simulate_disease
        and tree.root is not None
    ):

        tree.root.health = min(
            tree.root.health,
            25
        )

        tree.root.diseased = True

    # Apply mutation.
    mutated = tree.mutate_nodes(
        water=water,
        energy=energy,
        care=care
    )

    # Spread disease.
    if simulate_disease:

        affected = tree.spread_disease()

    else:

        affected = []

    # Export current structure.
    nodes = export_tree(tree)

    # Determine plant stage.
    stage = "stem"

    if any(
        node["part_type"] == "fruit"
        for node in nodes
    ):

        stage = "fruit"

    elif any(
        node["part_type"] == "flower"
        for node in nodes
    ):

        stage = "flower"

    elif any(
        node["part_type"] == "leaf"
        for node in nodes
    ):

        stage = "leaf"

    main = tree.root

    return {

        "name": plant_name,

        "health":
            main.health
            if main
            else health,

        "stage": stage,

        "trait":
            main.trait
            if main
            else "normal",

        "diseased":
            bool(main.diseased)
            if main
            else False,

        "node_count":
            tree.count_nodes(),

        "mutated":
            len(mutated),

        "disease_spread":
            len(affected),

        "nodes": nodes,

        "message":
            f"{len(mutated)} node(s) mutated; "
            f"{len(affected)} node(s) affected by disease."
    }


print("Topic 5 loaded.")
print("BST + Node Mutation ready.")
`
};


// ============================================================
// PART 5 JAVASCRIPT BRIDGE
// ============================================================

window.runBSTForGardenPlant = async function (
    position,
    disease = false
) {

    try {

        position = Number(position);

        if (
            !Number.isInteger(position)
            || position < 0
            || position >= 25
        ) {

            showToast(
                "Invalid garden position."
            );

            return;
        }


        const plant =
            typeof getBSTGardenPlant === "function"
                ? getBSTGardenPlant(position)
                : null;


        if (!plant) {

            showToast(
                "Select a planted garden cell first."
            );

            return;
        }


        // Make sure Pyodide is available.
        await initPyodide();


        const py =
            pyodideInstance;


        py.globals.set(
            "_bst_plant_name",
            plant.name
        );

        py.globals.set(
            "_bst_plant_health",
            plant.health
        );

        py.globals.set(
            "_bst_water",
            Number(currentWater ?? 100)
        );

        py.globals.set(
            "_bst_energy",
            Number(currentEnergy ?? 100)
        );

        py.globals.set(
            "_bst_disease",
            Boolean(disease)
        );


        const result =
            await py.runPythonAsync(`

run_garden_plant_simulation(
    _bst_plant_name,
    _bst_plant_health,
    water=_bst_water,
    energy=_bst_energy,
    care=100,
    simulate_disease=_bst_disease
)

`);


        const data =
            result.toJs({
                dict_converter:
                    Object.fromEntries
            });


        result.destroy();


        if (
            !data
            || data.error
        ) {

            showToast(
                data?.error ||
                "Part 5 could not process the plant."
            );

            return;
        }


        // Keep the actual game plant synchronized.
        updateBSTGardenPlantState(
            position,
            data
        );


        // Update Part 5 UI.
        updateBSTSanctuary(
            data,
            position
        );


        // Record action.
        if (
            typeof pushAction === "function"
        ) {

            pushAction(
                disease
                    ? `Part 5 Disease Test: ${plant.name}`
                    : `Part 5 Growth Mutation: ${plant.name}`
            );
        }


        showToast(
            disease
                ? `${plant.name}: disease simulation complete.`
                : `${plant.name}: BST growth mutation complete.`
        );


    } catch (error) {

        console.error(
            "Part 5 error:",
            error
        );

        showToast(
            "Part 5 could not connect to the plant."
        );
    }
};


// ============================================================
// PART 5 UI INITIALIZATION
// ============================================================

window.initBSTSanctuary = function () {

    const refresh =
        document.getElementById(
            "bst-refresh-button"
        );

    const grow =
        document.getElementById(
            "bst-grow-button"
        );

    const disease =
        document.getElementById(
            "bst-disease-button"
        );


    refresh?.addEventListener(
        "click",
        () => {

            const position =
                getSelectedBSTPosition();

            if (position < 0) {

                showToast(
                    "Select a planted cell first."
                );

                return;
            }

            runBSTForGardenPlant(
                position,
                false
            );
        }
    );


    grow?.addEventListener(
        "click",
        () => {

            const position =
                getSelectedBSTPosition();

            if (position < 0) {

                showToast(
                    "Select a planted cell first."
                );

                return;
            }

            runBSTForGardenPlant(
                position,
                false
            );
        }
    );


    disease?.addEventListener(
        "click",
        () => {

            const position =
                getSelectedBSTPosition();

            if (position < 0) {

                showToast(
                    "Select a planted cell first."
                );

                return;
            }

            runBSTForGardenPlant(
                position,
                true
            );
        }
    );

};


// ============================================================
// GET CURRENT PART 5 SELECTION
// ============================================================

function getSelectedBSTPosition() {

    if (
        typeof window.selectedGardenPosition ===
        "number"
    ) {

        return window.selectedGardenPosition;
    }

    return -1;
}


// ============================================================
// START PART 5
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initBSTSanctuary();

    }
);