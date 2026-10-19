package uz.axm.nexus.ai.application.assistant;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import uz.axm.nexus.ai.domain.assistant.*;

import java.util.ArrayList;
import java.util.List;

/**
 * MockAiProviderAdapter:
 * Tashqi API kaliti bo'lmaganda yoki tarmoq/rate-limit uzilishlarida
 * asosiy dars va test funksiyalari to'xtab qolmasligi uchun
 * boy pedagogik kontentni avtonom generatsiya qiluvchi adapter.
 */
@Component
@Slf4j
public class MockAiProviderAdapter implements AiProviderAdapter {

    @Override
    public String getProviderName() {
        return "mock";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public AiCompletionResponse complete(AiPromptRequest request, String systemPrompt) {
        log.info("Generating autonomous pedagogical response using Mock/Offline engine for intent: {}", request.getIntent());

        String lang = (request.getLanguage() != null) ? request.getLanguage().toLowerCase() : "uz";
        String subject = (request.getSubject() != null && !request.getSubject().isBlank()) ? request.getSubject() : "Web Full-Stack Development";
        String grade = (request.getGradeLevel() != null && !request.getGradeLevel().isBlank()) ? request.getGradeLevel() : "8-sinf";
        String topic = (request.getTopic() != null && !request.getTopic().isBlank()) ? request.getTopic() : "Kompyuter arxitekturasi va apparat ta'minoti";

        if (request.getRole() == AiRole.MENTOR_ASSISTANT) {
            return handleMentorUseCases(request, lang, subject, grade, topic);
        } else {
            return handleStudentUseCases(request, lang, subject, grade, topic);
        }
    }

    private AiCompletionResponse handleMentorUseCases(AiPromptRequest req, String lang, String subject, String grade, String topic) {
        AiIntent intent = req.getIntent() != null ? req.getIntent() : AiIntent.LESSON_PLAN;

        switch (intent) {
            case LESSON_PLAN -> {
                AiLessonPlanDetailsDto plan = AiLessonPlanDetailsDto.builder()
                        .title(topic + " — 80 daqiqalik dars rejasi")
                        .subject(subject)
                        .gradeLevel(grade)
                        .topic(topic)
                        .learningObjectives("O'quvchilar " + topic + " ning asosiy tamoyillari, uning apparat va dasturiy ta'minotdagi rolini tushunib yetishadi.")
                        .expectedOutcomes("Dars yakunida o'quvchilar mustaqil ravishda mavzu bo'yicha tushunchalarni tahlil qila oladi va amaliy topshiriqni 100% bajara oladi.")
                        .requiredMaterials("Proyektor, slaydar, kompyuter laboratoriyasi, kod muharriri (VS Code).")
                        .theoryContent("1. Kirish (5 daqiqa): O'tgan mavzuni takrorlash va motivatsiya.\n2. Nazariy tushuntirish (20 daqiqa): Fon Neyman arxitekturasi, CPU ning arifmetik-mantiqiy qurilmasi (ALU), boshqaruv bloki (CU) va registrlar. Xotira iyerarxiyasi: Kesh (L1, L2, L3) -> RAM -> Doimiy xotira (SSD/HDD).\n3. Savol-javob (5 daqiqa).")
                        .theoryDurationMinutes(20)
                        .practicalContent("Amaliy mashg'ulot (25 daqiqa):\n- Simulyator dasturida buyruqlar sikli (fetch-decode-execute) qanday kechishini vizual kuzatish.\n- Assambler buyruqlari yordamida registrlardagi sonlar ustida amallar bajarish.\n- O'quvchilar juftlikda (pair programming) topshiriqlarni yechishadi.")
                        .practicalDurationMinutes(25)
                        .exercises("1. Mashq: RAM va ROM o'rtasidagi asosiy farqlarni jadvalga tushiring.\n2. Mashq: 64-bitlik arxitekturaning 32-bitlikdan asosiy afzalliklarini sanang.\n3. Muammoli vaziyat: Nega kompyuterda faqat RAM emas, balki kesh xotira ham kerak?")
                        .homework("Mavzu bo'yicha qisqa konspekt tayyorlash va o'z noutbukingiz/telefoningiz protsessori hamda xotirasi xarakteristikasini jadvalga yozib kelish.")
                        .durationMinutes(80)
                        .build();

                String markdown = """
                        ### 📚 Tavsiya etilgan 80 daqiqalik Dars Rejasi: %s
                        **Fan:** %s | **Sinf:** %s | **Davomiyligi:** 80 daqiqa
                        
                        #### 🎯 Maqsad va Kutilayotgan Natijalar:
                        - %s
                        - %s
                        
                        #### ⏱️ Vaqt taqsimoti:
                        - **00-05 min:** Tashkiliy qism, salomlashish va o'tgan darsni takrorlash
                        - **05-25 min (20 daqiqa):** Yangi mavzu nazariyasi (%s)
                        - **25-50 min (25 daqiqa):** Amaliy laboratoriya mashg'uloti
                        - **50-70 min (20 daqiqa):** Mustaqil va differensial mashqlar
                        - **70-80 min (10 daqiqa):** Dars xulosasi, baholash va uyga vazifa
                        
                        #### 💡 Metodik tavsiya:
                        Ushbu dars rejasini **"Dars rejasi sifatida saqlash"** tugmasi orqali tizimga DRAFT holatida import qilishingiz va tahrirlashingiz mumkin.
                        """.formatted(topic, subject, grade, plan.getLearningObjectives(), plan.getExpectedOutcomes(), topic);

                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.MENTOR_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-pedagogical-v2")
                        .tokensUsed(480)
                        .content(markdown)
                        .generatedLessonPlan(plan)
                        .build();
            }

            case QUIZ_GENERATION -> {
                List<AiQuizQuestionDto> questions = List.of(
                        AiQuizQuestionDto.builder()
                                .questionText("Fon Neyman kompyuter arxitekturasida barcha arifmetik va mantiqiy amallarni bajaruvchi asosiy blok qaysi?")
                                .questionType("MULTIPLE_CHOICE")
                                .options(List.of("A) Arifmetik-mantiqiy qurilma (ALU)", "B) Boshqaruv qurilmasi (CU)", "C) Tezkor xotira (RAM)", "D) Tizim shinasi (Bus)"))
                                .correctAnswer("A) Arifmetik-mantiqiy qurilma (ALU)")
                                .explanation("ALU (Arithmetic Logic Unit) protsessorning matematik hisoblashlar va mantiqiy solishtirishlarni bajaruvchi asosiy yuragidir.")
                                .points(25)
                                .build(),
                        AiQuizQuestionDto.builder()
                                .questionText("Tezkor xotira (RAM) haqidagi qaysi fikr to'g'ri?")
                                .questionType("MULTIPLE_CHOICE")
                                .options(List.of("A) Elektr quvvati o'chganda ma'lumotlar saqlanib qoladi", "B) Elektr quvvati o'chganda ma'lumotlar to'liq o'chib ketadi (volatillik)", "C) Unga faqat bir marta ma'lumot yozish mumkin", "D) U doimiy fayllarni saqlash uchun xizmat qiladi"))
                                .correctAnswer("B) Elektr quvvati o'chganda ma'lumotlar to'liq o'chib ketadi (volatillik)")
                                .explanation("RAM operativ xotirasi uchuvchan (volatile) bo'lib, energiya uzilganda ma'lumotlar yo'qoladi.")
                                .points(25)
                                .build(),
                        AiQuizQuestionDto.builder()
                                .questionText("Protsessor buyruqlar siklining (Instruction Cycle) to'g'ri tartibini ko'rsating:")
                                .questionType("MULTIPLE_CHOICE")
                                .options(List.of("A) Fetch -> Decode -> Execute", "B) Execute -> Decode -> Fetch", "C) Decode -> Execute -> Store", "D) Fetch -> Execute -> Compile"))
                                .correctAnswer("A) Fetch -> Decode -> Execute")
                                .explanation("CPU xotiradan buyruqni o'qiydi (Fetch), uni dekodlaydi (Decode) va ijro etadi (Execute).")
                                .points(25)
                                .build(),
                        AiQuizQuestionDto.builder()
                                .questionText("Nima sababdan CPU bilan RAM o'rtasida Kesh (Cache) xotira pog'onasi kiritilgan?")
                                .questionType("MULTIPLE_CHOICE")
                                .options(List.of("A) Protsessor tezligi va RAM tezligi o'rtasidagi katta uzilishni (bottleneck) kamaytirish uchun", "B) Kompyuter narxini pasaytirish uchun", "C) RAM hajmini oshirish uchun", "D) Protsessorni sovutish uchun"))
                                .correctAnswer("A) Protsessor tezligi va RAM tezligi o'rtasidagi katta uzilishni (bottleneck) kamaytirish uchun")
                                .explanation("CPU juda yuqori chastotada ishlaydi, RAM esa sekinroq. Kesh xotira eng ko'p ishlatiladigan buyruqlarni protsessor yaqinida saqlaydi.")
                                .points(25)
                                .build()
                );

                String markdown = """
                        ### 📝 AI tomonidan tuzilgan test savollari (4 ta savol):
                        **Mavzu:** %s | **Sinf:** %s | **Jami ball:** 100 ball
                        
                        1. **Fon Neyman kompyuter arxitekturasida arifmetik va mantiqiy amallarni bajaruvchi asosiy blok qaysi?**
                           - A) Arifmetik-mantiqiy qurilma (ALU) ✅
                           - B) Boshqaruv qurilmasi (CU)
                           - C) Tezkor xotira (RAM)
                           - D) Tizim shinasi (Bus)
                           *(Izoh: ALU barcha arifmetik hisob-kitoblarni amalga oshiradi.)*
                        
                        2. **Tezkor xotira (RAM) haqidagi qaysi fikr to'g'ri?**
                           - A) Elektr quvvati o'chganda ma'lumotlar saqlanib qoladi
                           - B) Elektr quvvati o'chganda ma'lumotlar to'liq o'chib ketadi (volatillik) ✅
                           - C) Unga faqat bir marta ma'lumot yozish mumkin
                           - D) U doimiy fayllarni saqlash uchun xizmat qiladi
                        
                        3. **Protsessor buyruqlar siklining to'g'ri tartibini ko'rsating:**
                           - A) Fetch -> Decode -> Execute ✅
                           - B) Execute -> Decode -> Fetch
                           - C) Decode -> Execute -> Store
                           - D) Fetch -> Execute -> Compile
                        
                        4. **Nima sababdan CPU bilan RAM o'rtasida Kesh (Cache) xotira kiritilgan?**
                           - A) Protsessor va RAM o'rtasidagi tezlik uzilishini kamaytirish uchun ✅
                           - B) Kompyuter narxini pasaytirish uchun
                           - C) RAM hajmini oshirish uchun
                           - D) Protsessorni sovutish uchun
                        
                        💡 *Mentorlar ushbu savollarni ko'rib chiqib, **"Test sifatida saqlash"** orqali rasmiy nazorat shakliga aylantirishlari mumkin.*
                        """.formatted(topic, grade);

                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.MENTOR_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-pedagogical-v2")
                        .tokensUsed(520)
                        .content(markdown)
                        .generatedQuizQuestions(questions)
                        .build();
            }

            case CONCEPT_EXPLANATION -> {
                String markdown = """
                        ### 🎓 Mavzu tushuntirishi (%s o'quvchilari uchun): %s
                        
                        **Oddiy o'xshatish (Analogiya):**
                        Kompyuterni katta oshxona deb tasavvur qiling:
                        - **CPU (Bosh oshpaz):** Buyruqlarni qabul qiladi, sabzavotlarni to'g'raydi, taomni pishiradi.
                        - **RAM (Ish stoli):** Bosh oshpaz hozir ishlatayotgan mahsulotlar turadigan joy. Stol qanchalik katta bo'lsa, bir vaqtning o'zida shuncha ko'p taom tayyorlash mumkin. Ammo ish kuni tugab oshxona yopilganda (elektr o'chganda) stol tozalanadi.
                        - **Kesh xotira (Oshpazning qo'lidagi cho'ntak yoki taxtacha):** Eng zarur ziravorlar va pichoq turadigan joy — stolga borib kelishdan ham tezroq!
                        - **Doimiy xotira / SSD (Omborxona yoki muzlatkich):** Barcha retseptlar va oziq-ovqatlar uzoq vaqt buzilmasdan saqlanadigan joy.
                        
                        **Asosiy atamalar:**
                        1. **ALU:** Qo'shish, ayirish, ko'paytirish kabi matematik amallarni bajaradi.
                        2. **CU:** Barcha qismlarga qachon va nima qilishni buyuradi (Yo'l harakati boshqaruvchisi).
                        3. **Registrlar:** Protsessor ichidagi eng kichik, lekin eng chaqqon xotira hujayralari.
                        """;
                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.MENTOR_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-pedagogical-v2")
                        .tokensUsed(350)
                        .content(markdown.formatted(grade, topic))
                        .build();
            }

            case DIFFERENTIATED_EXERCISES -> {
                String markdown = """
                        ### 🧩 3 Darajali Differensial Topshiriqlar: %s
                        
                        🟢 **1-Daraja (Boshlang'ich - Barcha o'quvchilar uchun):**
                        - Kompyuteringizning protsessori nomi, yadrolari soni va operativ xotirasi (RAM) hajmini aniqlang.
                        - ALU va CU ning vazifalarini bittadan gap bilan tushuntiring.
                        
                        🟡 **2-Daraja (O'rta - O'zlashtirishi yaxshi o'quvchilar uchun):**
                        - Dastur ishga tushirilganda SSD dan RAM ga va undan CPU keshiga ma'lumotlar o'tish marshrutini blok-sxema shaklida chizing.
                        - Nega zamonaviy smartfonlarda 8 ta yadro bo'ladi va ular nega turlicha (katta va kichik) ishlashini tahlil qiling.
                        
                        🔴 **3-Daraja (Yuqori / Olimpiada darajasi - Iqtidorli o'quvchilar uchun):**
                        - 32-bitli arxitekturada nega maksimal 4 GB RAM ishlatish mumkinligini ikkilik sanoq sistemasi (2^32) orqali isbotlab bering.
                        - Kesh xotiradagi "Cache Hit" va "Cache Miss" tushunchalarini dasturiy optimallash misolida izohlang.
                        """;
                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.MENTOR_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-pedagogical-v2")
                        .tokensUsed(410)
                        .content(markdown.formatted(topic))
                        .build();
            }

            default -> {
                String markdown = "### 📌 Pedagogik Tavsiya: " + topic + "\n\nO'quvchilarning faolligini oshirish uchun interaktiv simulyatsiyalardan foydalanish va amaliy topshiriqlarni hayotiy keyslar bilan bog'lash tavsiya etiladi.";
                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.MENTOR_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-pedagogical-v2")
                        .tokensUsed(200)
                        .content(markdown)
                        .build();
            }
        }
    }

    private AiCompletionResponse handleStudentUseCases(AiPromptRequest req, String lang, String subject, String grade, String topic) {
        AiIntent intent = req.getIntent() != null ? req.getIntent() : AiIntent.SIMPLE_EXPLANATION;

        switch (intent) {
            case EXERCISE_HINT -> {
                String markdown = """
                        ### 💡 Masala bo'yicha yo'naltiruvchi Maslahat (Hint)
                        
                        To'g'ridan-to'g'ri tayyor javobni berish o'rniga, keling birga fikrlaymiz!
                        
                        🔍 **1-Maslahat (Boshlash uchun):**
                        - Masalada qaysi xotira turi haqida so'ralayotganiga e'tibor bering.
                        - Elektr quvvati o'chganda ma'lumot yo'qoladigan (uchuvchan) xotira qaysi edi?
                        
                        🧩 **2-Maslahat (O'ylab ko'ring):**
                        - Qattiq disk (SSD) kompyuter o'chganda ham o'yinlar va rasmlarni saqlab qoladi. Demak javob SSD emas.
                        - Protsessor o'ziga yaqin turgan qaysi xotira bilan doimiy muloqot qiladi?
                        
                        *Javobingizni tanlang yoki yozing, to'g'ri-noto'g'riligini birgalikda tekshiramiz!*
                        """;
                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.STUDENT_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-tutor-v2")
                        .tokensUsed(280)
                        .content(markdown)
                        .build();
            }

            case EXPLAIN_INCORRECT_ANSWER -> {
                String markdown = """
                        ### 🧐 Noto'g'ri javob tahlili va sababi
                        
                        Xato qilish — bu o'rganishning eng yaxshi usuli! Xavotir olmang, keling tahlil qilamiz:
                        
                        ❌ **Siz tanlagan variant:** "Doimiy xotira (SSD)"
                        ✅ **To'g'ri javob:** "Tezkor xotira (RAM)"
                        
                        **Nega bunday?**
                        - Protsessor juda tez ishlaydi (sekundiga milliardlab amal).
                        - Qattiq disk (SSD) esa protsessorga nisbatan minglab marta sekin. Agar protsessor har bir amal uchun to'g'ridan-to'g'ri diskka murojaat qilsa, kompyuter juda qotib qolgan bo'lardi.
                        - Shuning uchun o'rtada chaqqon **RAM** joylashgan — u dastur ochilganda kerakli ma'lumotlarni o'ziga oladi va tezkor yetkazib turadi.
                        
                        Keyingi safar bu savol tushsa, albatta to'g'ri topasiz!
                        """;
                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.STUDENT_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-tutor-v2")
                        .tokensUsed(310)
                        .content(markdown)
                        .build();
            }

            default -> {
                String markdown = """
                        ### 🚀 %s tushunchasi oddiy so'zlar bilan
                        
                        Salom! Ushbu mavzuni tushunish juda oson.
                        
                        Kompyuteringiz — bu murakkab temir quti emas, balki bir-biri bilan ahil ishlaydigan jamoa:
                        1. **Protsessor (Miya):** O'ylaydi, qo'shadi, ayiradi, qaror qabul qiladi.
                        2. **RAM (Qisqa muddatli xotira):** Hozir dars qilayotganingizda daftaringiz ochiq turgan sahifasi.
                        3. **SSD/Disk (Kutubxona):** Barcha kitoblar javonda saqlanadigan joy.
                        
                        Yana qaysi qismi haqida savolingiz bor? Bemalol so'rashingiz mumkin!
                        """.formatted(topic);

                return AiCompletionResponse.builder()
                        .success(true)
                        .role(AiRole.STUDENT_ASSISTANT)
                        .intent(intent)
                        .provider("mock")
                        .model("nexus-tutor-v2")
                        .tokensUsed(260)
                        .content(markdown)
                        .build();
            }
        }
    }
}
