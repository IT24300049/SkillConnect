package com.itp.skilledworker.config;

import com.itp.skilledworker.entity.EquipmentCategory;
import com.itp.skilledworker.entity.EquipmentInventory;
import com.itp.skilledworker.entity.JobCategory;
import com.itp.skilledworker.entity.SupplierProfile;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.repository.EquipmentCategoryRepository;
import com.itp.skilledworker.repository.EquipmentInventoryRepository;
import com.itp.skilledworker.repository.JobCategoryRepository;
import com.itp.skilledworker.repository.SupplierProfileRepository;
import com.itp.skilledworker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final JobCategoryRepository jobCategoryRepository;
    private final EquipmentCategoryRepository equipmentCategoryRepository;
    private final EquipmentInventoryRepository equipmentInventoryRepository;
    private final SupplierProfileRepository supplierProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedJobCategories();
        seedEquipmentCategories();
        seedSupplierMockMaterials();
    }

    private void seedAdmin() {
        String adminEmail = "admin@skillconnect.com";
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        admin.setRole(User.Role.admin);
        admin.setIsVerified(true);
        admin.setIsActive(true);
        userRepository.save(admin);
        log.info("✅ Default admin created: {} / Admin@123", adminEmail);
    }

    private void seedJobCategories() {
        if (jobCategoryRepository.count() > 0)
            return;

        String[][] cats = {
                { "Plumbing", "🔧", "Pipe repairs, installations, and maintenance" },
                { "Electrical", "⚡", "Wiring, panel work, lighting installations" },
                { "Painting", "🎨", "Interior and exterior painting services" },
                { "Carpentry", "🪚", "Furniture, doors, cabinets, woodwork" },
                { "Masonry", "🧱", "Brickwork, tiling, plastering" },
                { "Cleaning", "🧹", "Deep cleaning, regular maintenance" },
                { "Landscaping", "🌿", "Garden design, lawn care, tree trimming" },
                { "Roofing", "🏠", "Roof repairs, installations, waterproofing" },
                { "HVAC", "❄️", "Air conditioning, ventilation, heating" },
                { "Welding", "🔩", "Metal fabrication, gate work, welding repairs" },
                { "Appliance Repair", "🔌", "Washing machine, fridge, TV repairs" },
                { "Moving & Transport", "🚛", "House moving, goods transport" },
                { "General Labor", "👷", "Helper work, loading/unloading, misc tasks" },
                { "IT & Networking", "💻", "Computer repair, networking, CCTV installation" },
        };

        for (String[] c : cats) {
            JobCategory jc = new JobCategory();
            jc.setCategoryName(c[0]);
            jc.setCategoryIcon(c[1]);
            jc.setDescription(c[2]);
            jobCategoryRepository.save(jc);
        }
        log.info("✅ Seeded {} job categories", cats.length);
    }

    private void seedEquipmentCategories() {
        if (equipmentCategoryRepository.count() > 0)
            return;

        String[][] cats = {
                { "Power Tools", "🔌", "Drills, grinders, saws, sanders" },
                { "Hand Tools", "🔨", "Hammers, wrenches, screwdrivers" },
                { "Construction", "🏗", "Scaffolding, mixers, compactors" },
                { "Painting Equipment", "🎨", "Spray guns, rollers, ladders" },
                { "Plumbing Tools", "🔧", "Pipe cutters, wrenches, soldering kits" },
                { "Electrical Tools", "⚡", "Testers, wire strippers, crimping tools" },
                { "Garden Equipment", "🌿", "Mowers, trimmers, blowers" },
                { "Safety Equipment", "🦺", "Helmets, harnesses, gloves, boots" },
                { "Cleaning Equipment", "🧹", "Pressure washers, vacuum cleaners" },
                { "Heavy Machinery", "🚜", "Excavators, loaders, cranes" },
        };

        for (String[] c : cats) {
            EquipmentCategory ec = new EquipmentCategory();
            ec.setCategoryName(c[0]);
            ec.setCategoryIcon(c[1]);
            ec.setDescription(c[2]);
            equipmentCategoryRepository.save(ec);
        }
        log.info("✅ Seeded {} equipment categories", cats.length);
    }

    private void seedSupplierMockMaterials() {
        String supplierEmail = "supplier1@gmail.com";
        String supplierPassword = "123456";

        User supplierUser = userRepository.findByEmail(supplierEmail).orElseGet(() -> {
            User user = new User();
            user.setEmail(supplierEmail);
            user.setPasswordHash(passwordEncoder.encode(supplierPassword));
            user.setRole(User.Role.supplier);
            user.setIsVerified(true);
            user.setIsActive(true);
            return userRepository.save(user);
        });

        SupplierProfile profile = supplierProfileRepository.findByUser_UserId(supplierUser.getUserId()).orElseGet(() -> {
            SupplierProfile sp = new SupplierProfile();
            sp.setUser(supplierUser);
            sp.setBusinessName("Supplier One Materials");
            sp.setBusinessRegistrationNumber("SUP-001-ITP");
            sp.setContactPersonName("Supplier One");
            sp.setCity("Colombo");
            sp.setDistrict("Colombo");
            sp.setIsVerified(true);
            return supplierProfileRepository.save(sp);
        });

        if (!equipmentInventoryRepository.findBySupplier_SupplierId(profile.getSupplierId()).isEmpty()) {
            return;
        }

        Map<String, EquipmentCategory> categoriesByName = new LinkedHashMap<>();
        for (EquipmentCategory category : equipmentCategoryRepository.findAll()) {
            categoriesByName.put(category.getCategoryName(), category);
        }

        // Power Tools
        createMockMaterial(profile, categoriesByName.get("Power Tools"), "Angle Grinder", "Heavy-duty 850W angle grinder for cutting, grinding, and polishing metal and masonry surfaces", new BigDecimal("1500.00"), new BigDecimal("15000.00"), 8);
        createMockMaterial(profile, categoriesByName.get("Power Tools"), "Electric Drill", "Powerful 13mm corded electric drill suitable for wood, metal, and concrete drilling", new BigDecimal("1200.00"), new BigDecimal("12000.00"), 10);
        createMockMaterial(profile, categoriesByName.get("Power Tools"), "Rotary Hammer Drill", "1100W SDS-plus rotary hammer for heavy-duty drilling and chiseling in concrete and stone", new BigDecimal("2500.00"), new BigDecimal("25000.00"), 5);
        createMockMaterial(profile, categoriesByName.get("Power Tools"), "Circular Saw", "1200W circular saw with 185mm blade for precise straight cuts in wood and boards", new BigDecimal("1800.00"), new BigDecimal("18000.00"), 6);
        createMockMaterial(profile, categoriesByName.get("Power Tools"), "Jigsaw", "650W jigsaw for curved and intricate cuts in wood, plastic, and thin metal sheets", new BigDecimal("1400.00"), new BigDecimal("14000.00"), 4);

        // Hand Tools
        createMockMaterial(profile, categoriesByName.get("Hand Tools"), "Hammer Set", "Set of claw and ball-peen hammers in various weights for general construction and demolition", new BigDecimal("400.00"), new BigDecimal("3000.00"), 15);
        createMockMaterial(profile, categoriesByName.get("Hand Tools"), "Pipe Wrench Set", "Heavy-duty 14-inch and 18-inch pipe wrenches for gripping and turning threaded pipes and fittings", new BigDecimal("600.00"), new BigDecimal("5000.00"), 10);
        createMockMaterial(profile, categoriesByName.get("Hand Tools"), "Screwdriver Set", "Professional 12-piece screwdriver set including flathead and Phillips in various sizes", new BigDecimal("300.00"), new BigDecimal("2500.00"), 20);
        createMockMaterial(profile, categoriesByName.get("Hand Tools"), "Hacksaw", "Heavy-duty hacksaw with adjustable frame for cutting metal pipes, bolts, and rods", new BigDecimal("350.00"), new BigDecimal("2500.00"), 12);
        createMockMaterial(profile, categoriesByName.get("Hand Tools"), "Spirit Level (1.2m)", "1.2-meter aluminum spirit level with 3 vials for accurate horizontal and vertical leveling", new BigDecimal("500.00"), new BigDecimal("4000.00"), 10);

        // Construction
        createMockMaterial(profile, categoriesByName.get("Construction"), "Concrete Mixer", "350-litre drum electric concrete mixer for mixing cement, sand, and aggregate on-site", new BigDecimal("5000.00"), new BigDecimal("50000.00"), 4);
        createMockMaterial(profile, categoriesByName.get("Construction"), "Scaffolding Set (3m)", "Steel scaffolding frame set up to 3 meters height, suitable for plastering and painting work", new BigDecimal("4500.00"), new BigDecimal("40000.00"), 6);
        createMockMaterial(profile, categoriesByName.get("Construction"), "Plate Compactor", "Petrol-powered plate compactor for compacting soil, gravel, and asphalt in small to medium areas", new BigDecimal("4000.00"), new BigDecimal("35000.00"), 3);
        createMockMaterial(profile, categoriesByName.get("Construction"), "Tile Cutter", "Manual rail tile cutter with 600mm cutting length for ceramic and porcelain tiles", new BigDecimal("1500.00"), new BigDecimal("12000.00"), 5);
        createMockMaterial(profile, categoriesByName.get("Construction"), "Laser Level", "Self-leveling cross-line laser level with 30m range for accurate alignment in construction", new BigDecimal("2000.00"), new BigDecimal("20000.00"), 4);

        // Painting Equipment
        createMockMaterial(profile, categoriesByName.get("Painting Equipment"), "Airless Paint Sprayer", "Electric airless sprayer with 3.3L/min flow for fast, even application of wall and ceiling paint", new BigDecimal("3500.00"), new BigDecimal("30000.00"), 4);
        createMockMaterial(profile, categoriesByName.get("Painting Equipment"), "Paint Roller Set", "Complete paint roller kit with 9-inch roller frame, tray, and 3 roller covers for smooth surfaces", new BigDecimal("400.00"), new BigDecimal("2000.00"), 20);
        createMockMaterial(profile, categoriesByName.get("Painting Equipment"), "Extension Paint Pole", "Telescopic aluminum paint pole extending from 1.2m to 2.4m for ceiling and high wall painting", new BigDecimal("300.00"), new BigDecimal("1500.00"), 15);
        createMockMaterial(profile, categoriesByName.get("Painting Equipment"), "Pressure Washer", "1800 PSI electric pressure washer for surface cleaning and preparation before painting", new BigDecimal("3000.00"), new BigDecimal("25000.00"), 5);

        // Plumbing Tools
        createMockMaterial(profile, categoriesByName.get("Plumbing Tools"), "Pipe Threading Machine", "Electric pipe threading machine for cutting threads on steel pipes from 1/2 inch to 2 inches", new BigDecimal("3500.00"), new BigDecimal("30000.00"), 3);
        createMockMaterial(profile, categoriesByName.get("Plumbing Tools"), "Drain Snake (15m)", "15-meter manual drain auger for clearing blockages in sinks, toilets, and floor drains", new BigDecimal("1500.00"), new BigDecimal("10000.00"), 5);
        createMockMaterial(profile, categoriesByName.get("Plumbing Tools"), "Pipe Bender", "Hydraulic pipe bender for bending copper and steel pipes from 15mm to 50mm diameter", new BigDecimal("2000.00"), new BigDecimal("18000.00"), 4);
        createMockMaterial(profile, categoriesByName.get("Plumbing Tools"), "Soldering Torch Kit", "Propane soldering torch kit for copper pipe joints and fittings with safety valve", new BigDecimal("1200.00"), new BigDecimal("8000.00"), 6);

        // Electrical Tools
        createMockMaterial(profile, categoriesByName.get("Electrical Tools"), "Cable Wire Stripper", "Professional wire stripper and crimper for stripping cables from 0.5mm to 6mm diameter", new BigDecimal("400.00"), new BigDecimal("3000.00"), 10);
        createMockMaterial(profile, categoriesByName.get("Electrical Tools"), "Multimeter (Digital)", "Auto-ranging digital multimeter for measuring voltage, current, resistance, and continuity", new BigDecimal("800.00"), new BigDecimal("6000.00"), 8);
        createMockMaterial(profile, categoriesByName.get("Electrical Tools"), "Cable Pulling Rope Set", "30-meter fiberglass cable pulling rod set for threading wires through conduits and walls", new BigDecimal("1200.00"), new BigDecimal("8000.00"), 5);

        // Garden Equipment
        createMockMaterial(profile, categoriesByName.get("Garden Equipment"), "Petrol Lawn Mower", "160cc petrol lawn mower with 46cm cutting width for medium to large garden lawns", new BigDecimal("3500.00"), new BigDecimal("30000.00"), 4);
        createMockMaterial(profile, categoriesByName.get("Garden Equipment"), "Brush Cutter", "52cc petrol brush cutter for clearing overgrown grass, weeds, and light shrubs", new BigDecimal("2500.00"), new BigDecimal("20000.00"), 6);
        createMockMaterial(profile, categoriesByName.get("Garden Equipment"), "Garden Tiller", "Electric mini tiller with 400mm tilling width for loosening soil in garden beds and plots", new BigDecimal("3000.00"), new BigDecimal("25000.00"), 3);

        // Safety Equipment
        createMockMaterial(profile, categoriesByName.get("Safety Equipment"), "Hard Hat", "HDPE construction hard hat with 4-point suspension system, meets safety standards", new BigDecimal("200.00"), new BigDecimal("1500.00"), 30);
        createMockMaterial(profile, categoriesByName.get("Safety Equipment"), "Safety Harness Full Body", "Full-body safety harness with dorsal D-ring for fall protection when working at heights", new BigDecimal("800.00"), new BigDecimal("6000.00"), 12);
        createMockMaterial(profile, categoriesByName.get("Safety Equipment"), "Safety Cone Set (10pcs)", "Set of 10 high-visibility orange traffic cones for cordoning off work zones", new BigDecimal("600.00"), new BigDecimal("4000.00"), 8);

        // Cleaning Equipment
        createMockMaterial(profile, categoriesByName.get("Cleaning Equipment"), "Industrial Wet & Dry Vacuum", "30-litre industrial wet and dry vacuum cleaner for post-construction dust and debris cleanup", new BigDecimal("2000.00"), new BigDecimal("18000.00"), 5);
        createMockMaterial(profile, categoriesByName.get("Cleaning Equipment"), "Floor Scrubber", "Electric single-disc floor scrubber for deep cleaning tiles and concrete floors", new BigDecimal("2500.00"), new BigDecimal("20000.00"), 3);

        // Heavy Machinery
        createMockMaterial(profile, categoriesByName.get("Heavy Machinery"), "Excavator (Mini)", "1.5-tonne mini excavator with 2.5m digging depth for trenching, landscaping, and foundation work", new BigDecimal("45000.00"), new BigDecimal("200000.00"), 2);
        createMockMaterial(profile, categoriesByName.get("Heavy Machinery"), "Backhoe Loader", "75HP backhoe loader for excavation, loading, and site clearing on medium construction projects", new BigDecimal("75000.00"), new BigDecimal("350000.00"), 2);
        createMockMaterial(profile, categoriesByName.get("Heavy Machinery"), "Generator (10kVA)", "10kVA diesel generator for powering tools and equipment on sites without grid electricity", new BigDecimal("8000.00"), new BigDecimal("60000.00"), 4);

        profile.setTotalEquipmentCount(equipmentInventoryRepository.findBySupplier_SupplierId(profile.getSupplierId()).size());
        supplierProfileRepository.save(profile);

        log.info("✅ Seeded mock supplier with materials: {} / {}", supplierEmail, supplierPassword);
    }

    private void createMockMaterial(
            SupplierProfile supplier,
            EquipmentCategory category,
            String name,
            String description,
            BigDecimal rentalPrice,
            BigDecimal deposit,
            Integer quantity) {
        if (category == null) {
            return;
        }

        EquipmentInventory item = new EquipmentInventory();
        item.setSupplier(supplier);
        item.setEquipmentCategory(category);
        item.setEquipmentName(name);
        item.setEquipmentDescription(description);
        item.setEquipmentCondition(EquipmentInventory.EquipmentCondition.good);
        item.setRentalPricePerDay(rentalPrice);
        item.setQuantityTotal(quantity);
        item.setQuantityAvailable(quantity);
        item.setIsAvailable(true);

        equipmentInventoryRepository.save(item);
    }
}
