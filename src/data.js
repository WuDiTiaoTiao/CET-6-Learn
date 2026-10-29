export const LEVELS = {
  beginner: {
    id: "beginner",
    label: "初级",
    subtitle: "大纲基础高频",
    target: 2000,
    color: "teal"
  },
  intermediate: {
    id: "intermediate",
    label: "中级",
    subtitle: "阅读核心词",
    target: 4500,
    color: "blue"
  },
  advanced: {
    id: "advanced",
    label: "高级",
    subtitle: "熟词僻义与难词",
    target: 8500,
    color: "ink"
  }
};

export const DEFAULT_SETTINGS = {
  selectedLevel: "beginner",
  inputMode: "scribble",
  exerciseMode: "meaning-to-word",
  completedToday: 0,
  streak: 0,
  lastStudyDate: ""
};

export const SEED_WORDS = [
  { id: "acquire", word: "acquire", meaning: "获得；学到", phonetic: "/əˈkwaɪər/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "Students acquire knowledge through practice." },
  { id: "approach", word: "approach", meaning: "方法；接近；处理", phonetic: "/əˈprəʊtʃ/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "The researchers adopted a new approach." },
  { id: "benefit", word: "benefit", meaning: "益处；使受益", phonetic: "/ˈbenɪfɪt/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "Regular reading benefits language learners." },
  { id: "concern", word: "concern", meaning: "关心；担忧；涉及", phonetic: "/kənˈsɜːn/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "The report concerns the quality of education." },
  { id: "consume", word: "consume", meaning: "消耗；消费", phonetic: "/kənˈsjuːm/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "Modern devices consume less energy." },
  { id: "contribute", word: "contribute", meaning: "贡献；促成", phonetic: "/kənˈtrɪbjuːt/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "Many factors contribute to the result." },
  { id: "establish", word: "establish", meaning: "建立；证实", phonetic: "/ɪˈstæblɪʃ/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "The study establishes a link between the two factors." },
  { id: "factor", word: "factor", meaning: "因素；要素", phonetic: "/ˈfæktər/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "Cost is an important factor in the decision." },
  { id: "indicate", word: "indicate", meaning: "表明；指出", phonetic: "/ˈɪndɪkeɪt/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "The figures indicate a steady increase." },
  { id: "maintain", word: "maintain", meaning: "保持；坚持认为", phonetic: "/meɪnˈteɪn/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "It is difficult to maintain public trust." },
  { id: "require", word: "require", meaning: "需要；要求", phonetic: "/rɪˈkwaɪər/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "The task requires careful analysis." },
  { id: "significant", word: "significant", meaning: "重要的；显著的", phonetic: "/sɪɡˈnɪfɪkənt/", level: "beginner", tags: ["postgraduate-exam", "core"], example: "There was a significant change in public opinion." },
  { id: "acknowledge", word: "acknowledge", meaning: "承认；确认收到", phonetic: "/əkˈnɒlɪdʒ/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "The author acknowledges the limits of the study." },
  { id: "advocate", word: "advocate", meaning: "提倡；拥护者", phonetic: "/ˈædvəkeɪt/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "Many experts advocate early intervention." },
  { id: "alter", word: "alter", meaning: "改变；修改", phonetic: "/ˈɔːltər/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "Technology has altered the way people communicate." },
  { id: "assess", word: "assess", meaning: "评估；评价", phonetic: "/əˈses/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "Researchers must assess the available evidence." },
  { id: "circumstance", word: "circumstance", meaning: "情况；条件；环境", phonetic: "/ˈsɜːkəmstæns/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "The decision depends on individual circumstances." },
  { id: "consequence", word: "consequence", meaning: "结果；后果", phonetic: "/ˈkɒnsɪkwəns/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "Every policy has unintended consequences." },
  { id: "demonstrate", word: "demonstrate", meaning: "证明；展示", phonetic: "/ˈdemənstreɪt/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "The experiment demonstrates the effect clearly." },
  { id: "emphasize", word: "emphasize", meaning: "强调；重视", phonetic: "/ˈemfəsaɪz/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "The article emphasizes the value of cooperation." },
  { id: "encounter", word: "encounter", meaning: "遇到；遭遇", phonetic: "/ɪnˈkaʊntər/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "Graduates may encounter a competitive job market." },
  { id: "phenomenon", word: "phenomenon", meaning: "现象", phonetic: "/fəˈnɒmɪnən/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "The phenomenon has attracted public attention." },
  { id: "principle", word: "principle", meaning: "原则；原理", phonetic: "/ˈprɪnsəpəl/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "The proposal is based on a simple principle." },
  { id: "relevant", word: "relevant", meaning: "有关的；切题的", phonetic: "/ˈreləvənt/", level: "intermediate", tags: ["postgraduate-exam", "reading"], example: "Only relevant information should be included." },
  { id: "ambiguous", word: "ambiguous", meaning: "含糊的；有歧义的", phonetic: "/æmˈbɪɡjuəs/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "The wording of the question is ambiguous." },
  { id: "controversial", word: "controversial", meaning: "有争议的", phonetic: "/ˌkɒntrəˈvɜːʃəl/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "The reform remains highly controversial." },
  { id: "deteriorate", word: "deteriorate", meaning: "恶化；退化", phonetic: "/dɪˈtɪəriəreɪt/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Working conditions continued to deteriorate." },
  { id: "indispensable", word: "indispensable", meaning: "不可或缺的", phonetic: "/ˌɪndɪˈspensəbəl/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Trust is indispensable to effective teamwork." },
  { id: "legitimate", word: "legitimate", meaning: "合法的；合理的", phonetic: "/lɪˈdʒɪtɪmət/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Citizens have a legitimate concern about privacy." },
  { id: "manipulate", word: "manipulate", meaning: "操纵；熟练操作", phonetic: "/məˈnɪpjəleɪt/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Images can be manipulated to influence readers." },
  { id: "obscure", word: "obscure", meaning: "模糊的；使难以理解", phonetic: "/əbˈskjʊər/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Technical language may obscure the main argument." },
  { id: "perceive", word: "perceive", meaning: "察觉；理解；认为", phonetic: "/pəˈsiːv/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "People perceive risk in different ways." },
  { id: "preliminary", word: "preliminary", meaning: "初步的；预备的", phonetic: "/prɪˈlɪmɪnəri/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Preliminary findings support the hypothesis." },
  { id: "reluctant", word: "reluctant", meaning: "不情愿的；勉强的", phonetic: "/rɪˈlʌktənt/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Some firms are reluctant to change their practices." },
  { id: "scrutinize", word: "scrutinize", meaning: "仔细检查；审视", phonetic: "/ˈskruːtənaɪz/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Readers should scrutinize the evidence carefully." },
  { id: "undermine", word: "undermine", meaning: "削弱；逐渐损害", phonetic: "/ˌʌndəˈmaɪn/", level: "advanced", tags: ["postgraduate-exam", "advanced-reading"], example: "Misinformation can undermine public confidence." }
];
