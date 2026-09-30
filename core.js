// ============================================================
// CORE GAME JAVASCRIPT
// Shared game state, UI, Pyodide bridge, garden, weather,
// shop, progression, topic loading, and application startup.
// Topic source code lives in part1script.js ... part12script.js.
// ============================================================

        // =====================================================================
        // SEMANTIC VERSIONING (SemVer 2.0.0)
        // Single source of truth. Do not hard-code the version elsewhere.
        // MAJOR: breaking change (e.g. changing bridge function names/signatures that Python depends on)
        // MINOR: new backward-compatible feature (e.g. finishing a new topic's code)
        // PATCH: bug fix or small tweak with no new feature
        // Use 0.x.y while in development; move to 1.0.0 once all 11 topics are complete.
        // =====================================================================
        const APP_VERSION = "0.3.0";

        let pyodideInstance = null;
        let gardenPlants = {};
        let plantHealth = {};
        let currentCoins = 990;
        let currentWater = 200;
        let currentSeeds = 90;
        let currentEnergy = 110;
        let currentHope = 80;
        let shovelMode = false;
        let harvestedInventory = {};
        let seedInventory = {};
        let soldCounts = { Flowers: 0, Fruits: 0 };
        let currentLevel = 1;
        let lastWeather = null;
        let displayActionHistory = [];



const topicTemplates = window.topicTemplates || (window.topicTemplates = {});

        const allSeeds = [
            { name: "Rose", emoji: "🌹", category: "Flowers", level: 1, seedCost: 10, sellValue: 18 },
            { name: "Sunflower", emoji: "🌻", category: "Flowers", level: 1, seedCost: 15, sellValue: 25 },
            { name: "Sampaguita", emoji: "🌼", category: "Flowers", level: 1, seedCost: 20, sellValue: 32 },
            { name: "Apple", emoji: "🍎", category: "Fruits", level: 2, seedCost: 40, sellValue: 65 },
            { name: "Strawberry", emoji: "🍓", category: "Fruits", level: 2, seedCost: 50, sellValue: 80 },
            { name: "Watermelon", emoji: "🍉", category: "Fruits", level: 2, seedCost: 70, sellValue: 110 },
            { name: "Tomato", emoji: "🍅", category: "Vegetables", level: 3, seedCost: 80, sellValue: 130 },
            { name: "Carrot", emoji: "🥕", category: "Vegetables", level: 3, seedCost: 90, sellValue: 150 },
            { name: "Eggplant", emoji: "🍆", category: "Vegetables", level: 3, seedCost: 110, sellValue: 180 }
        ];



        async function initPyodide() {
            if (pyodideInstance) return;
            const consoleEl = document.getElementById("output-console");
            if (consoleEl) consoleEl.innerHTML = `<span class="text-amber-400">Loading Python...</span><br>`;
            try {
                pyodideInstance = await loadPyodide();
                pyodideInstance.globals.set("addPlantToGrid", addPlantToGrid);
                pyodideInstance.globals.set("updateResources", updateResources);
                pyodideInstance.globals.set("addPlantsToDropdown", addPlantsToDropdown);
                pyodideInstance.globals.set("pushAction", pushAction);
                pyodideInstance.globals.set("updateClimateQueue", updateClimateQueue);
                pyodideInstance.globals.set("currentCoinsFromSimulator", () => currentCoins);
                await pyodideInstance.runPythonAsync(`
                    import sys
                    from js import document
                    class Console:
                        def write(self, text):
                            if text and text.strip():
                                el = document.getElementById("output-console")
                                if el:
                                    el.innerHTML += text.replace("\\n", "<br>")
                        def flush(self): pass
                    sys.stdout = Console()
                `);
                if (consoleEl) consoleEl.innerHTML = `<span class="text-emerald-400">Python ready.</span><br>`;
            } catch (err) {
                if (consoleEl) consoleEl.innerHTML = `<span class="text-red-400">Failed to load Python: ${err.message}</span>`;
                throw err;
            }
        }

        function updateClimateQueue(events) {
            const container = document.getElementById("climate-queue");
            container.innerHTML = "";
            if (!events || !events.length) {
                const div = document.createElement("div");
                div.className = "text-xs text-emerald-300/70";
                div.textContent = lastWeather ? `Last weather: ${lastWeather.name} (${lastWeather.severity})` : "No weather event waiting.";
                container.appendChild(div);
                return;
            }
            events.forEach(event => {
                const div = document.createElement("div");
                div.className = "p-3 bg-amber-950/40 border border-amber-900 rounded-xl text-xs";
                div.textContent = event;
                container.appendChild(div);
            });
        }

        function getSeed(name) {
            return allSeeds.find(seed => seed.name === name);
        }

        function isUnlocked(seed) {
            if (seed.level === 1) return true;
            if (seed.level === 2) return soldCounts.Flowers >= 50;
            return soldCounts.Flowers >= 50 && soldCounts.Fruits >= 25;
        }

        function calculateLevel() {
            if (soldCounts.Flowers >= 50 && soldCounts.Fruits >= 25) return 3;
            if (soldCounts.Flowers >= 50) return 2;
            return 1;
        }

        function addPlantToGrid(pos, name) {
            gardenPlants[pos] = name;
            if (plantHealth[pos] === undefined) plantHealth[pos] = 100;
            renderGarden();
        }

        function renderGarden() {
            const grid = document.getElementById("garden-grid");
            grid.innerHTML = "";
            for (let i = 0; i < 25; i++) {
                const cell = document.createElement("div");
                const plant = gardenPlants[i];
                const info = plant ? getSeed(plant) : null;
                const hp = plant ? (plantHealth[i] ?? 100) : null;
                const status = hp === null ? "" : hp >= 70 ? "Healthy" : hp >= 40 ? "Weak" : "Critical";
                cell.className = "aspect-square bg-[#2a3825] rounded-xl flex flex-col items-center justify-center text-2xl border border-emerald-800 transition hover:border-emerald-400 hover:bg-[#34462e] cursor-pointer p-1";
                if (plant) {
                    cell.innerHTML = `<div>${info?.emoji || "🌱"}</div><div class="text-[9px] font-bold text-emerald-100 truncate max-w-full">${plant}</div><div class="text-[8px] ${status === "Healthy" ? "text-emerald-300" : status === "Weak" ? "text-amber-300" : "text-red-300"}">${hp}/100 ${status}</div>`;
                    cell.title = shovelMode ? `Shovel ${plant} - no refund` : `${plant} planted - click to harvest`;
                } else {
                    cell.textContent = "⬜";
                    cell.title = shovelMode ? "Empty tile" : "Click to plant";
                }
                cell.setAttribute("aria-label", cell.title);
                cell.addEventListener("click", () => handleGardenClick(i));
                grid.appendChild(cell);
            }
        }

        function handleGardenClick(position) {
            if (shovelMode) {
                shovelPlant(position);
                return;
            }
            if (gardenPlants[position]) {
                harvestPlant(position);
                return;
            }
            plantSeed(position);
        }

        function plantSeed(position) {
            if (gardenPlants[position]) {
                showToast("This tile is already planted. Click it to harvest or use the shovel.");
                return;
            }
            const selectedPlant = document.getElementById("crop-selector").value;
            if (!selectedPlant) {
                showToast("Buy a seed first.");
                return;
            }
            const count = seedInventory[selectedPlant] || 0;
            if (count <= 0) {
                showToast("You do not own that seed.");
                return;
            }
            const plant = getSeed(selectedPlant);
            seedInventory[selectedPlant]--;
            currentSeeds = Math.max(0, currentSeeds - 1);
            gardenPlants[position] = selectedPlant;
            plantHealth[position] = 100;
            pushAction(`Plant ${selectedPlant} (-1 seed)`);
            updateResources(currentWater, currentSeeds, currentEnergy, currentHope, currentCoins);
            refreshSeedSelectors();
            renderGarden();
            showToast(`${selectedPlant} planted.`);
        }

        function harvestPlant(position) {
            const name = gardenPlants[position];
            if (!name) return;
            const seed = getSeed(name);
            harvestedInventory[name] = (harvestedInventory[name] || 0) + 1;
            delete gardenPlants[position];
            delete plantHealth[position];
            pushAction(`Harvest ${name}`);
            renderGarden();
            refreshSellSelector();
            showToast(`${seed.emoji} ${name} harvested. Ready to sell.`);
        }

        function shovelPlant(position) {
            const name = gardenPlants[position];
            if (!name) {
                showToast("There is no plant on this tile.");
                return;
            }
            const hp = plantHealth[position] ?? 100;
            delete gardenPlants[position];
            delete plantHealth[position];
            pushAction(`Shovel ${name} (removed - NO REFUND)`);
            renderGarden();
            showToast(`${name} removed. The seed cost was not refunded.`);
        }

        function toggleShovel() {
            shovelMode = !shovelMode;
            const button = document.getElementById("shovel-button");
            button.textContent = shovelMode ? "Shovel: ON" : "Shovel: OFF";
            button.className = shovelMode
                ? "bg-red-800 hover:bg-red-700 border border-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold"
                : "bg-[#2a3825] hover:bg-[#34462e] border border-emerald-800 text-emerald-200 px-3 py-2 rounded-xl text-xs font-bold";
            renderGarden();
            showToast(shovelMode ? "Shovel mode ON. Removed plants are not refunded." : "Shovel mode OFF.");
        }

        async function generateWeatherFromSimulator() {
            try {
                await initPyodide();
                document.getElementById("topic-selector").value = "2";
                loadTopic();
                await pyodideInstance.runPythonAsync(topicTemplates[2].code);
                const result = await pyodideInstance.runPythonAsync(`climate_queue.next_weather()`);
                if (result) {
                    const event = {
                        name: result.name,
                        severity: result.severity,
                        water: result.water_effect,
                        energy: result.energy_effect,
                        health: result.plant_health_effect
                    };
                    lastWeather = event;
                    applyWeatherToPlants(event.health);
                    updateClimateQueue([`${event.name} [${event.severity}] | Water ${event.water >= 0 ? "+" : ""}${event.water} | Energy ${event.energy >= 0 ? "+" : ""}${event.energy} | Plant Health ${event.health >= 0 ? "+" : ""}${event.health}`]);
                    pushAction(`Weather: ${event.name} (${event.severity})`);
                    showToast(`${event.name}: ${event.health >= 0 ? "+" : ""}${event.health} plant health`);
                }
            } catch (err) {
                document.getElementById("output-console").innerHTML += `<span class="text-red-400">Weather Error: ${err.message}</span><br>`;
            }
        }

        function applyWeatherToPlants(healthEffect) {
            Object.keys(gardenPlants).forEach(pos => {
                const key = Number(pos);
                plantHealth[key] = Math.max(0, Math.min(100, (plantHealth[key] ?? 100) + healthEffect));
            });
            renderGarden();
        }

        function updateResources(water, seeds, energy, hope, coins) {
            if (typeof water === "object" && water !== null) {
                const args = water;
                water = args.water ?? 0;
                seeds = args.seeds ?? 0;
                energy = args.energy ?? 0;
                hope = args.hope ?? 0;
                coins = args.coins ?? 0;
            }
            currentWater = water ?? currentWater;
            currentSeeds = seeds ?? currentSeeds;
            currentEnergy = energy ?? currentEnergy;
            currentHope = hope ?? currentHope;
            currentCoins = coins ?? currentCoins;
            document.getElementById("water-text").innerText = `${currentWater} / 200 L`;
            document.getElementById("water-bar").style.width = `${Math.min(100, Math.max(0, (currentWater / 200) * 100))}%`;
            document.getElementById("seeds-text").innerText = `${currentSeeds} / 100`;
            document.getElementById("seeds-bar").style.width = `${Math.min(100, Math.max(0, (currentSeeds / 100) * 100))}%`;
            document.getElementById("energy-text").innerText = `${currentEnergy} / 120 Wh`;
            document.getElementById("energy-bar").style.width = `${Math.min(100, Math.max(0, (currentEnergy / 120) * 100))}%`;
            document.getElementById("hope-text").innerText = `${currentHope} / 100`;
            document.getElementById("hope-bar").style.width = `${Math.min(100, Math.max(0, (currentHope / 100) * 100))}%`;
            updateCoins();
        }

        function updateCoins() {
            document.getElementById("coins-text").innerText = `${currentCoins} Coins`;
        }

        function addPlantsToDropdown(plants) {
            if (plants && plants.length) {
                plants.forEach(([name, emoji, cost]) => {
                    if (!getSeed(name)) {
                        allSeeds.push({ name, emoji, category: "Flowers", level: 1, seedCost: cost, sellValue: cost * 2 });
                    }
                });
            }
            refreshSeedSelectors();
        }

        function refreshSeedSelectors(preferredCrop = null, preferredShop = null) {
            const crop = document.getElementById("crop-selector");
            const shop = document.getElementById("shop-selector");

            // IMPORTANT:
            // Rebuilding a <select> resets its value to the first option.
            // Remember the player's current choice before rebuilding.
            const savedCrop = preferredCrop ?? crop.value;
            const savedShop = preferredShop ?? shop.value;

            crop.innerHTML = "";
            shop.innerHTML = "";

            const unlockedSeeds = allSeeds.filter(isUnlocked);

            unlockedSeeds.forEach(seed => {
                const count = seedInventory[seed.name] || 0;

                const cropOpt = document.createElement("option");
                cropOpt.value = seed.name;
                cropOpt.textContent = `${seed.emoji} ${seed.name} x${count}`;
                crop.appendChild(cropOpt);

                const shopOpt = document.createElement("option");
                shopOpt.value = seed.name;
                shopOpt.textContent =
                    `${seed.emoji} ${seed.name} - Buy ${seed.seedCost}c / Sell ${seed.sellValue}c`;
                shop.appendChild(shopOpt);
            });

            // Restore the player's selected Seed Bag item.
            if (
                savedCrop &&
                [...crop.options].some(option => option.value === savedCrop)
            ) {
                crop.value = savedCrop;
            }

            // Restore the player's selected Shop item.
            if (
                savedShop &&
                [...shop.options].some(option => option.value === savedShop)
            ) {
                shop.value = savedShop;
            }

            refreshSellSelector();
        }

        function refreshSellSelector() {
            const sell = document.getElementById("sell-selector");
            sell.innerHTML = "";
            const items = Object.keys(harvestedInventory).filter(name => harvestedInventory[name] > 0 && isUnlocked(getSeed(name)));
            if (!items.length) {
                const opt = document.createElement("option");
                opt.textContent = "No harvested crops";
                opt.value = "";
                sell.appendChild(opt);
                return;
            }
            items.forEach(name => {
                const seed = getSeed(name);
                const opt = document.createElement("option");
                opt.value = name;
                opt.textContent = `${seed.emoji} ${name} x${harvestedInventory[name]} - ${seed.sellValue}c each`;
                sell.appendChild(opt);
            });
        }

        function buySelectedSeed() {
            const shopSelector = document.getElementById("shop-selector");
            const cropSelector = document.getElementById("crop-selector");

            const name = shopSelector.value;
            const seed = getSeed(name);

            if (!seed) return;

            if (!isUnlocked(seed)) {
                showToast("That seed level is locked.");
                return;
            }

            if (currentCoins < seed.seedCost) {
                showToast("Not enough coins to buy this seed.");
                return;
            }

            // Remember both selections before the selectors are refreshed.
            const previousShopSelection = name;
            const previousCropSelection = cropSelector.value;

            currentCoins -= seed.seedCost;
            seedInventory[name] = (seedInventory[name] || 0) + 1;
            currentSeeds += 1;

            pushAction(`Buy ${name} Seed (-${seed.seedCost} coins)`);

            updateResources(
                currentWater,
                currentSeeds,
                currentEnergy,
                currentHope,
                currentCoins
            );

            // Refresh WITHOUT jumping back to Rose.
            refreshSeedSelectors(
                previousCropSelection,
                previousShopSelection
            );

            showToast(`${name} seed purchased.`);
        }

        function sellSelectedCrop() {
            const name = document.getElementById("sell-selector").value;
            const seed = getSeed(name);
            if (!seed || !(harvestedInventory[name] > 0)) {
                showToast("No harvested crop to sell.");
                return;
            }
            harvestedInventory[name]--;
            currentCoins += seed.sellValue;
            if (seed.category === "Flowers") soldCounts.Flowers++;
            if (seed.category === "Fruits") soldCounts.Fruits++;
            const previousLevel = currentLevel;
            currentLevel = calculateLevel();
            pushAction(`Sell ${name} (+${seed.sellValue} coins)`);
            updateResources(currentWater, currentSeeds, currentEnergy, currentHope, currentCoins);
            refreshSeedSelectors();
            refreshSellSelector();
            updateProgressionUI();
            if (currentLevel > previousLevel) {
                showToast(`Level ${currentLevel} unlocked! New seeds are available.`);
                pushAction(`LEVEL ${currentLevel} UNLOCKED`);
            } else {
                showToast(`${name} sold for ${seed.sellValue} coins.`);
            }
        }

        function updateProgressionUI() {
            currentLevel = calculateLevel();

            const flowersUnlocked = true;
            const fruitsUnlocked = soldCounts.Flowers >= 50;
            const vegetablesUnlocked =
                fruitsUnlocked && soldCounts.Fruits >= 25;

            document.getElementById("progress-summary").innerHTML = `
                <div class="font-bold text-emerald-200">
                    Current Level: ${currentLevel}
                </div>
                <div>🌸 Flowers: ${soldCounts.Flowers}/50 sold</div>
                <div>🍎 Fruits: ${soldCounts.Fruits}/25 sold</div>
                <div>🥕 Vegetables:
                    ${vegetablesUnlocked ? "UNLOCKED" : "LOCKED"}
                </div>
            `;

            const tree = document.getElementById("hierarchy-tree");

            // The tree is deliberately visible inside the lower section
            // of the Action History panel.
            tree.innerHTML = `
                <div class="text-emerald-100 font-bold mb-2 text-sm">
                    🌳 GARDEN HIERARCHICAL TREE
                </div>

                <div class="font-mono text-[11px] leading-6">
                    <div class="text-emerald-200 font-bold">
                        🌱 GARDEN
                    </div>

                    <div class="ml-2">
                        ├── 🌸
                        <span class="font-bold">FLOWERS</span>
                        <span class="text-emerald-300">
                            [LEVEL 1 ✓]
                        </span>
                    </div>

                    <div class="ml-6 text-emerald-200">
                        └── Sold:
                        ${soldCounts.Flowers}/50
                    </div>

                    <div class="ml-2">
                        ├── 🍎
                        <span class="font-bold">FRUITS</span>
                        <span class="${fruitsUnlocked
                            ? "text-emerald-300"
                            : "text-amber-300"}">
                            [${fruitsUnlocked
                                ? "LEVEL 2 ✓"
                                : "LEVEL 2 🔒"}]
                        </span>
                    </div>

                    <div class="ml-6 text-emerald-200">
                        └── Sold:
                        ${soldCounts.Fruits}/25
                    </div>

                    <div class="ml-2">
                        └── 🥕
                        <span class="font-bold">VEGETABLES</span>
                        <span class="${vegetablesUnlocked
                            ? "text-emerald-300"
                            : "text-amber-300"}">
                            [${vegetablesUnlocked
                                ? "LEVEL 3 ✓"
                                : "LEVEL 3 🔒"}]
                        </span>
                    </div>
                </div>

                <div class="mt-3 pt-2 border-t border-emerald-800/60">
                    <div class="text-[9px] uppercase tracking-widest text-emerald-500 font-bold mb-1">
                        Traversals
                    </div>

                    <div class="text-[10px] text-emerald-200">
                        Preorder:
                        Garden → Flowers → Fruits → Vegetables
                    </div>

                    <div class="text-[10px] text-emerald-200">
                        Level-order:
                        Garden → Flowers → Fruits → Vegetables
                    </div>
                </div>
            `;
        }

        function pushAction(action) {
            displayActionHistory.push({ label: action });
            if (displayActionHistory.length > 10) displayActionHistory.shift();
            renderActionStack();
        }

        function renderActionStack() {
            const container = document.getElementById("action-stack");
            container.innerHTML = "";
            [...displayActionHistory].reverse().forEach(action => {
                const div = document.createElement("div");
                div.className = "bg-emerald-950/60 border-l-2 border-amber-500 px-3 py-2 rounded text-xs text-emerald-100";
                div.textContent = `→ ${action.label}`;
                container.appendChild(div);
            });
        }

        function showToast(msg) {
            const toast = document.createElement("div");
            toast.className = "fixed bottom-6 right-6 bg-emerald-900 border border-emerald-400 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 text-sm";
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        async function runPythonCode() {
            const consoleEl = document.getElementById("output-console");
            consoleEl.innerHTML = `<span class="text-amber-400">Running...</span><br>`;
            try {
                await initPyodide();
                const code = document.getElementById("code-editor").value.trim();
                await pyodideInstance.runPythonAsync(code);
                updateProgressionUI();
                refreshSeedSelectors();
            } catch (err) {
                consoleEl.innerHTML += `<span class="text-red-400">Error: ${err.message}</span>`;
            }
        }

        function loadTopic() {
            const key = document.getElementById("topic-selector").value;
            document.getElementById("code-editor").value = topicTemplates[key].code;
        }

        function switchTab(tab) {
            document.getElementById("view-game").classList.toggle("hidden", tab !== "game");
            document.getElementById("view-code").classList.toggle("hidden", tab !== "code");
            document.getElementById("tab-game").classList.toggle("bg-[#283623]", tab === "game");
            document.getElementById("tab-game").classList.toggle("text-emerald-100", tab === "game");
            document.getElementById("tab-code").classList.toggle("bg-[#283623]", tab === "code");
            document.getElementById("tab-code").classList.toggle("text-emerald-100", tab === "code");
        }

        window.onload = () => {
            document.getElementById("version-badge").textContent = "v" + APP_VERSION;
            lucide.createIcons();
            updateResources(200, 90, 110, 80, 990);
            seedInventory = { Rose: 5, Sunflower: 3, Sampaguita: 2 };
            currentSeeds = 10;
            refreshSeedSelectors();
            renderGarden();
            renderActionStack();
            updateProgressionUI();
            updateClimateQueue([]);

            const select = document.getElementById("topic-selector");
            Object.keys(topicTemplates).forEach(k => {
                const opt = document.createElement("option");
                opt.value = k;
                opt.textContent = topicTemplates[k].title;
                select.appendChild(opt);
            });
            loadTopic();
            switchTab("game");
            initPyodide().catch(() => {});
        };

