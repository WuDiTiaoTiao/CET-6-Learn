export const LEVELS = {
  beginner: {
    id: "beginner",
    label: "初级",
    subtitle: "基础高频",
    target: 2000,
    color: "teal"
  },
  intermediate: {
    id: "intermediate",
    label: "中级",
    subtitle: "核心学术",
    target: 4500,
    color: "blue"
  },
  advanced: {
    id: "advanced",
    label: "高级",
    subtitle: "高分表达",
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
  { id: "ocean", word: "ocean", meaning: "海洋；大海", phonetic: "/ˈəʊʃən/", level: "beginner", tags: ["geography"], example: "The ocean covers most of the Earth's surface." },
  { id: "marine", word: "marine", meaning: "海的；海洋的", phonetic: "/məˈriːn/", level: "beginner", tags: ["geography"], example: "The area is protected for marine life." },
  { id: "navigation", word: "navigation", meaning: "导航；航行", phonetic: "/ˌnævɪˈɡeɪʃən/", level: "beginner", tags: ["travel"], example: "Modern navigation makes the route easier to follow." },
  { id: "gulf", word: "gulf", meaning: "海湾；鸿沟；隔阂", phonetic: "/ɡʌlf/", level: "beginner", tags: ["geography"], example: "The boat crossed the gulf before sunset." },
  { id: "beach", word: "beach", meaning: "海滩；沙滩", phonetic: "/biːtʃ/", level: "beginner", tags: ["geography"], example: "We walked along the beach in the morning." },
  { id: "coast", word: "coast", meaning: "海岸；海滨", phonetic: "/kəʊst/", level: "beginner", tags: ["geography"], example: "The town is located on the east coast." },
  { id: "shore", word: "shore", meaning: "岸；滨", phonetic: "/ʃɔːr/", level: "beginner", tags: ["geography"], example: "The children collected shells on the shore." },
  { id: "tide", word: "tide", meaning: "潮汐；潮流", phonetic: "/taɪd/", level: "beginner", tags: ["geography"], example: "The tide was high when we arrived." },
  { id: "current", word: "current", meaning: "水流；气流；当前的", phonetic: "/ˈkʌrənt/", level: "beginner", tags: ["geography"], example: "The current carried the boat downstream." },
  { id: "brook", word: "brook", meaning: "小河；溪；容忍", phonetic: "/brʊk/", level: "beginner", tags: ["geography"], example: "A clear brook runs through the valley." },
  { id: "stream", word: "stream", meaning: "流；溪；流动", phonetic: "/striːm/", level: "beginner", tags: ["geography"], example: "A small stream flows behind the village." },
  { id: "stony", word: "stony", meaning: "多石的；石头制的", phonetic: "/ˈstəʊni/", level: "beginner", tags: ["nature"], example: "The stony path leads to the old lighthouse." },
  { id: "vertical", word: "vertical", meaning: "竖直的；垂直的", phonetic: "/ˈvɜːtɪkəl/", level: "beginner", tags: ["science"], example: "The cliff has a nearly vertical face." },
  { id: "steep", word: "steep", meaning: "陡峭的；急剧的", phonetic: "/stiːp/", level: "beginner", tags: ["landscape"], example: "The steep hill took an hour to climb." },
  { id: "horizon", word: "horizon", meaning: "地平线；眼界", phonetic: "/həˈraɪzən/", level: "beginner", tags: ["geography"], example: "The sun disappeared below the horizon." },
  { id: "renewable", word: "renewable", meaning: "可再生的", phonetic: "/rɪˈnjuːəbəl/", level: "intermediate", tags: ["environment"], example: "Wind is a renewable source of energy." },
  { id: "conserve", word: "conserve", meaning: "保护；节约；保存", phonetic: "/kənˈsɜːv/", level: "intermediate", tags: ["environment"], example: "We should conserve water during dry seasons." },
  { id: "diverse", word: "diverse", meaning: "多样的；不同的", phonetic: "/daɪˈvɜːs/", level: "intermediate", tags: ["society"], example: "The city has a diverse population." },
  { id: "substantial", word: "substantial", meaning: "大量的；实质的", phonetic: "/səbˈstænʃəl/", level: "intermediate", tags: ["academic"], example: "The project requires substantial investment." },
  { id: "inevitable", word: "inevitable", meaning: "不可避免的", phonetic: "/ɪnˈevɪtəbəl/", level: "intermediate", tags: ["academic"], example: "Some change is inevitable in a growing city." },
  { id: "hypothesis", word: "hypothesis", meaning: "假设；假说", phonetic: "/haɪˈpɒθəsɪs/", level: "intermediate", tags: ["academic"], example: "The experiment was designed to test the hypothesis." },
  { id: "mitigate", word: "mitigate", meaning: "减轻；缓和", phonetic: "/ˈmɪtɪɡeɪt/", level: "advanced", tags: ["academic"], example: "Trees can mitigate the effects of urban heat." },
  { id: "corroborate", word: "corroborate", meaning: "证实；支持", phonetic: "/kəˈrɒbəreɪt/", level: "advanced", tags: ["academic"], example: "Further evidence is needed to corroborate the claim." },
  { id: "disparity", word: "disparity", meaning: "差异；不平等", phonetic: "/dɪˈspærəti/", level: "advanced", tags: ["society"], example: "The report highlights a disparity in access to education." },
  { id: "ubiquitous", word: "ubiquitous", meaning: "无处不在的；普遍存在的", phonetic: "/juːˈbɪkwɪtəs/", level: "advanced", tags: ["academic"], example: "Smartphones are ubiquitous in modern life." },
  { id: "ambiguous", word: "ambiguous", meaning: "含糊的；模棱两可的", phonetic: "/æmˈbɪɡjuəs/", level: "advanced", tags: ["academic"], example: "The wording of the question was ambiguous." },
  { id: "paradigm", word: "paradigm", meaning: "范式；典范", phonetic: "/ˈpærədaɪm/", level: "advanced", tags: ["academic"], example: "The discovery created a new research paradigm." },
  { id: "resilient", word: "resilient", meaning: "有复原力的；坚韧的", phonetic: "/rɪˈzɪliənt/", level: "advanced", tags: ["society"], example: "Resilient communities recover faster after disasters." }
];
