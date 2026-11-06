import type {
  Language,
  LanguageCode,
  Lesson,
  LevelInfo,
  Word,
  GrammarQuestion,
  ListeningQuestion,
  SpeakingSentence,
} from '@/types'

// ================= 语言定义 =================
export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: '英语',
    nativeName: 'English',
    flag: '🇬🇧',
    locale: 'en-US',
    color: '#3b82f6',
    levelSystem: 'CEFR 欧标',
  },
  {
    code: 'ja',
    name: '日语',
    nativeName: '日本語',
    flag: '🇯🇵',
    locale: 'ja-JP',
    color: '#ec4899',
    levelSystem: 'JLPT 能力考',
  },
  {
    code: 'ko',
    name: '韩语',
    nativeName: '한국어',
    flag: '🇰🇷',
    locale: 'ko-KR',
    color: '#10b981',
    levelSystem: 'TOPIK 等级',
  },
]

export const getLanguage = (code: string): Language =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]

export const LEVELS: Record<LanguageCode, LevelInfo[]> = {
  en: [
    { index: 0, code: 'A1', title: '入门', desc: '掌握基础问候与日常表达，能进行最简单的交流' },
    { index: 1, code: 'A2', title: '初级', desc: '应对生活常见场景，描述身边的人和事' },
    { index: 2, code: 'B1', title: '中级', desc: '顺畅处理旅行与工作场景，表达观点与计划' },
    { index: 3, code: 'B2', title: '高级', desc: '讨论抽象社会话题，理解复杂文本的主旨' },
    { index: 4, code: 'C1', title: '精通', desc: '近母语者水平，驾驭专业沟通与文学表达' },
  ],
  ja: [
    { index: 0, code: 'N5', title: '入门', desc: '掌握五十音与基础句型，能寒暄和简单自我介绍' },
    { index: 1, code: 'N4', title: '初级', desc: '理解日常场景下的慢速日语，描述基本生活' },
    { index: 2, code: 'N3', title: '中级', desc: '理解日常场景概要，旅行与职场初步应对' },
    { index: 3, code: 'N2', title: '高级', desc: '理解广泛场景日语，能讨论社会与抽象议题' },
    { index: 4, code: 'N1', title: '精通', desc: '应对各种商务与学术场景，阅读复杂论述' },
  ],
  ko: [
    { index: 0, code: 'TOPIK 1', title: '入门', desc: '掌握韩文字母与基本问候，造句能力启蒙' },
    { index: 1, code: 'TOPIK 2', title: '初级', desc: '进行日常生活所需的基础对话' },
    { index: 2, code: 'TOPIK 3', title: '中级', desc: '在熟悉的社会场景中自如表达' },
    { index: 3, code: 'TOPIK 4', title: '高级', desc: '理解新闻与讨论中的核心内容' },
    { index: 4, code: 'TOPIK 6', title: '精通', desc: '接近母语者水平，掌握高级词汇与论述' },
  ],
}

// ================= 语料类型 =================
type WordTuple = [text: string, phonetic: string, meaning: string, example: string, exampleZh: string]
type GrammarTuple = [prompt: string, options: string[], answer: number, explanation: string]
type ListeningTuple = [audioText: string, title: string, options: string[], answer: number]
type SpeakingTuple = [text: string, zh: string, tip: string]

// ================= 英语语料 =================
const EN_WORDS: WordTuple[] = [
  ['hello', '/həˈloʊ/', '你好', 'Hello, nice to meet you!', '你好，很高兴认识你！'],
  ['thank', '/θæŋk/', '感谢', 'Thank you for your help.', '谢谢你的帮助。'],
  ['goodbye', '/ˌɡʊdˈbaɪ/', '再见', 'Goodbye, see you tomorrow!', '再见，明天见！'],
  ['yes', '/jes/', '是；对', 'Yes, I understand.', '是的，我明白。'],
  ['no', '/noʊ/', '不；没有', 'No problem at all.', '完全没问题。'],
  ['morning', '/ˈmɔːrnɪŋ/', '早晨', 'Good morning, everyone!', '大家早上好！'],
  ['friend', '/frend/', '朋友', 'She is my best friend.', '她是我最好的朋友。'],
  ['water', '/ˈwɔːtər/', '水', 'Can I have some water?', '可以给我一些水吗？'],
  ['book', '/bʊk/', '书', 'This book is very interesting.', '这本书很有趣。'],
  ['eat', '/iːt/', '吃', 'We eat dinner at seven.', '我们七点吃晚饭。'],
  ['drink', '/drɪŋk/', '喝；饮品', 'I drink tea every morning.', '我每天早上喝茶。'],
  ['love', '/lʌv/', '爱；喜爱', 'I love learning languages.', '我喜欢学习语言。'],
  ['family', '/ˈfæməli/', '家庭', 'My family is very big.', '我的家庭很大。'],
  ['school', '/skuːl/', '学校', 'The school is near my home.', '学校在我家附近。'],
  ['teacher', '/ˈtiːtʃər/', '老师', 'Our teacher is very kind.', '我们的老师很和蔼。'],
  ['student', '/ˈstuːdnt/', '学生', 'He is a hard-working student.', '他是个勤奋的学生。'],
  ['time', '/taɪm/', '时间', 'What time is it now?', '现在几点了？'],
  ['today', '/təˈdeɪ/', '今天', 'Today is a sunny day.', '今天是晴天。'],
  ['tomorrow', '/təˈmɔːroʊ/', '明天', 'See you tomorrow morning.', '明早见。'],
  ['house', '/haʊs/', '房子', 'Their house has a garden.', '他们的房子带花园。'],
  ['city', '/ˈsɪti/', '城市', 'Shanghai is a modern city.', '上海是一座现代化城市。'],
  ['food', '/fuːd/', '食物', 'The food here is delicious.', '这里的食物很美味。'],
  ['bread', '/bred/', '面包', 'I had bread for breakfast.', '我早餐吃了面包。'],
  ['coffee', '/ˈkɔːfi/', '咖啡', 'A cup of coffee, please.', '请来一杯咖啡。'],
  ['travel', '/ˈtrævl/', '旅行', 'I love to travel abroad.', '我喜欢出国旅行。'],
  ['airport', '/ˈerpɔːrt/', '机场', 'The airport is far away.', '机场很远。'],
  ['ticket', '/ˈtɪkɪt/', '票', 'I booked the ticket online.', '我在网上订了票。'],
  ['hotel', '/hoʊˈtel/', '酒店', 'We stayed at a small hotel.', '我们住在一家小酒店。'],
  ['weather', '/ˈweðər/', '天气', 'The weather is nice today.', '今天天气很好。'],
  ['rain', '/reɪn/', '雨；下雨', 'It will rain this afternoon.', '今天下午会下雨。'],
  ['work', '/wɜːrk/', '工作', 'I work in a tech company.', '我在一家科技公司工作。'],
  ['company', '/ˈkʌmpəni/', '公司', 'Her company has 500 employees.', '她的公司有500名员工。'],
  ['meeting', '/ˈmiːtɪŋ/', '会议', 'The meeting starts at ten.', '会议十点开始。'],
  ['email', '/ˈiːmeɪl/', '电子邮件', 'Please send me an email.', '请给我发一封邮件。'],
  ['phone', '/foʊn/', '电话；手机', 'My phone is out of battery.', '我的手机没电了。'],
  ['money', '/ˈmʌni/', '钱', 'I saved some money for the trip.', '我为旅行攒了些钱。'],
  ['environment', '/ɪnˈvaɪrənmənt/', '环境', 'We must protect the environment.', '我们必须保护环境。'],
  ['culture', '/ˈkʌltʃər/', '文化', 'I enjoy learning about new cultures.', '我喜欢了解新的文化。'],
  ['history', '/ˈhɪstəri/', '历史', 'Chinese history is fascinating.', '中国历史引人入胜。'],
  ['experience', '/ɪkˈspɪriəns/', '经验；经历', 'It was an unforgettable experience.', '那是一次难忘的经历。'],
  ['decision', '/dɪˈsɪʒn/', '决定', 'That was a difficult decision.', '那是一个艰难的决定。'],
  ['opportunity', '/ˌɑːpərˈtuːnəti/', '机会', 'This job is a great opportunity.', '这份工作是个绝佳机会。'],
  ['responsibility', '/rɪˌspɑːnsəˈbɪləti/', '责任', 'Leaders take responsibility.', '领导者承担责任。'],
  ['philosophy', '/fəˈlɑːsəfi/', '哲学', 'Eastern philosophy interests me.', '东方哲学让我很感兴趣。'],
  ['sophisticated', '/səˈfɪstɪkeɪtɪd/', '复杂精密的', 'The system is highly sophisticated.', '这个系统非常复杂精密。'],
]

const EN_GRAMMAR: GrammarTuple[] = [
  ['She ___ to school every day.', ['go', 'goes', 'going', 'went'], 1, '一般现在时中，第三人称单数主语 she 后动词加 -es。'],
  ['I have ___ finished my homework.', ['already', 'yet', 'ever'], 0, 'already 用于肯定句表示"已经"，yet 多用于否定/疑问句末。'],
  ['There ___ many books on the desk.', ['is', 'are', 'be'], 1, 'there be 句型中 be 动词与后面的主语 books 保持一致，用 are。'],
  ['This book is ___ than that one.', ['interesting', 'more interesting', 'most interesting'], 1, '两者比较用比较级，多音节形容词前加 more。'],
  ['He asked me ___ I was from.', ['that', 'what', 'where'], 2, '宾语从句表示"来自哪里"用 where 引导。'],
  ['If it ___ tomorrow, we will stay home.', ['rains', 'rained', 'will rain'], 0, '第一条件句：if 从句用一般现在时表将来。'],
  ['The letter ___ by her yesterday.', ['writes', 'wrote', 'was written'], 2, '信是"被写"的，且是昨天，用一般过去时被动 was written。'],
  ['I enjoy ___ to music.', ['listen', 'listening', 'to listen'], 1, 'enjoy 后接动名词 doing 形式。'],
  ['___ you mind if I opened the window?', ['Do', 'Would', 'Will'], 1, 'Would you mind... 是礼貌征求许可的固定表达。'],
  ['By the time we arrived, the movie ___.', ['started', 'had started', 'starts'], 1, '"过去的过去"用过去完成时 had + 过去分词。'],
]

const EN_LISTENING: ListeningTuple[] = [
  ['The train to Boston leaves from platform three at nine fifteen.', '火车从哪个站台发车？', ['3 号站台', '5 号站台', '9 号站台'], 0],
  ["I'd like a cup of coffee with milk but no sugar.", '她想要什么样的咖啡？', ['加奶不加糖', '加糖不加奶', '什么都不加的黑咖啡'], 0],
  ['Tom usually goes to the gym after work, but today he went swimming.', 'Tom 今天做了什么？', ['游泳', '去健身房', '跑步'], 0],
  ['Go straight and turn left at the second crossing.', '怎样到达邮局？', ['直走后第二个路口左转', '先右转再直走', '乘坐公交车'], 0],
  ['The meeting has been moved from Monday morning to Wednesday afternoon.', '会议改到什么时候了？', ['周三下午', '周一上午', '周五下午'], 0],
  ['My phone battery is almost dead, so I need to find a charger.', '他需要找什么？', ['充电器', '新手机', '充电宝'], 0],
]

const EN_SPEAKING: SpeakingTuple[] = [
  ['Hello, nice to meet you!', '你好，很高兴认识你！', '注意 hello 的 /h/ 送气，nice to 可连读。'],
  ['Thank you very much for your help.', '非常感谢你的帮助。', 'thank 中咬舌尖发 /θ/，语调先升后降显真诚。'],
  ['Could you please say that again more slowly?', '您能慢一点再说一遍吗？', 'Could you 轻读连读，slowly 重音在第一音节。'],
  ["I'd like to order a sandwich and a glass of orange juice.", '我想点一份三明治和一杯橙汁。', "I'd like to 连读为 /aɪd laɪk/，order 卷舌。"],
  ['Excuse me, how can I get to the nearest subway station?', '请问最近的地铁站怎么走？', 'Excuse me 用于搭话，句末用升调显礼貌。'],
  ['What do you usually do on the weekend?', '你周末通常做什么？', 'usually 三音节节奏均匀，weekend 重音在后。'],
  ['I have been learning English for about six months.', '我学英语大约六个月了。', 'have been + doing 现在完成进行时，for 弱读。'],
  ["The weather is really nice today, isn't it?", '今天天气真好，是吧？', '反义疑问部分 isn\'t it 用升调，像在邀请对方回应。'],
]

// ================= 日语语料 =================
const JA_WORDS: WordTuple[] = [
  ['こんにちは', 'konnichiwa', '你好（白天问候）', 'こんにちは、はじめまして。', '你好，初次见面。'],
  ['ありがとう', 'arigatou', '谢谢', 'どうもありがとう。', '非常感谢。'],
  ['さようなら', 'sayounara', '再见', 'さようなら、また明日。', '再见，明天见。'],
  ['はい', 'hai', '是；对', 'はい、わかりました。', '好的，我明白了。'],
  ['いいえ', 'iie', '不；不是', 'いいえ、大丈夫です。', '不，没关系。'],
  ['おはよう', 'ohayou', '早上好', 'おはようございます！', '早上好！'],
  ['友達', 'tomodachi', '朋友', '彼女は私の友達です。', '她是我的朋友。'],
  ['水', 'mizu', '水', '水を一杯ください。', '请给我一杯水。'],
  ['本', 'hon', '书', 'この本はとても面白いです。', '这本书很有趣。'],
  ['食べる', 'taberu', '吃', '朝ごはんを食べる。', '吃早饭。'],
  ['飲む', 'nomu', '喝', 'お茶を飲む。', '喝茶。'],
  ['愛', 'ai', '爱', '音楽を愛しています。', '我热爱音乐。'],
  ['家族', 'kazoku', '家人；家庭', '家族は六人です。', '我家有六口人。'],
  ['学校', 'gakkou', '学校', '学校は家の近くです。', '学校在我家附近。'],
  ['先生', 'sensei', '老师', '田中先生はやさしいです。', '田中老师很温柔。'],
  ['学生', 'gakusei', '学生', '彼はまじめな学生です。', '他是个认真的学生。'],
  ['時間', 'jikan', '时间', '時間がありません。', '没有时间了。'],
  ['今日', 'kyou', '今天', '今日はいい天気です。', '今天天气很好。'],
  ['明日', 'ashita', '明天', 'また明日会いましょう。', '明天再见吧。'],
  ['家', 'ie', '家', '家に帰ります。', '回家。'],
  ['町', 'machi', '城镇；街道', 'この町は静かです。', '这个小镇很安静。'],
  ['食べ物', 'tabemono', '食物', '日本の食べ物が好きです。', '我喜欢日本食物。'],
  ['パン', 'pan', '面包', '朝はパンを食べます。', '早上吃面包。'],
  ['コーヒー', 'koohii', '咖啡', 'コーヒーをお願いします。', '请来杯咖啡。'],
  ['旅行', 'ryokou', '旅行', '海外旅行が好きです。', '我喜欢海外旅行。'],
  ['空港', 'kuukou', '机场', '空港まで電車で行きます。', '坐电车去机场。'],
  ['切符', 'kippu', '票', '切符をネットで買いました。', '我在网上买了票。'],
  ['ホテル', 'hoteru', '酒店', '小さいホテルに泊まりました。', '住了一家小酒店。'],
  ['天気', 'tenki', '天气', '天気予報を聞く。', '听天气预报。'],
  ['雨', 'ame', '雨', '午後は雨が降ります。', '下午会下雨。'],
  ['仕事', 'shigoto', '工作', 'ITの仕事をしています。', '我做IT相关工作。'],
  ['会社', 'kaisha', '公司', '会社は駅の近くです。', '公司在车站附近。'],
  ['会議', 'kaigi', '会议', '会議は十時からです。', '会议从十点开始。'],
  ['メール', 'meeru', '邮件', 'メールを送ります。', '发邮件。'],
  ['電話', 'denwa', '电话', '電話に出る。', '接电话。'],
  ['お金', 'okane', '钱', '旅行のためにお金を貯める。', '为旅行存钱。'],
  ['環境', 'kankyou', '环境', '環境を守らなければなりません。', '必须保护环境。'],
  ['文化', 'bunka', '文化', '日本文化に興味があります。', '我对日本文化感兴趣。'],
  ['歴史', 'rekishi', '历史', '中国の歴史は長いです。', '中国历史悠久。'],
  ['経験', 'keiken', '经验', '貴重な経験をしました。', '获得了宝贵的经验。'],
  ['決定', 'kettei', '决定', '重要な決定を下す。', '做出重要决定。'],
  ['機会', 'kikai', '机会', 'いい機会ですね。', '真是个好机会。'],
  ['責任', 'sekinin', '责任', '責任を持って仕事をする。', '负责任地工作。'],
  ['哲学', 'tetsugaku', '哲学', '東洋哲学が好きです。', '我喜欢东方哲学。'],
  ['複雑', 'fukuzatsu', '复杂', 'このシステムは複雑です。', '这个系统很复杂。'],
]

const JA_GRAMMAR: GrammarTuple[] = [
  ['私___学生です。', ['は', 'が', 'を', 'に'], 0, 'は 是主题助词，用于提示句子主题"我"。'],
  ['ご飯を___。', ['食べます', '食べるです', '食べましたです'], 0, 'ます形直接接动词，不能再加 です。'],
  ['昨日、映画を___。', ['見ます', '見ました', '見て'], 1, '昨日 是过去时间，动词用ました形。'],
  ['日本語___話します。', ['を', 'が', 'で', 'に'], 0, 'を 提示他动词的宾语，"说日语"用 日本語を話す。'],
  ['これは誰___本ですか。', ['の', 'が', 'を', 'で'], 0, 'の 连接两个名词表示所属，"谁的书"。'],
  ['学校___行きます。', ['へ', 'を', 'が', 'で'], 0, 'へ（に）表示移动方向，"去学校"。'],
  ['毎日音楽を___います。', ['聞く', '聞いて', '聞きて'], 1, 'ています 前接て形，聞く 的て形是 聞いて。'],
  ['昨日は___。', ['暑いです', '暑かったです', '暑くです'], 1, 'い形容词过去式：~い → ~かったです。'],
  ['薬を___なりません。', ['飲みます', '飲まなければ', '飲むない'], 1, 'なければなりません 表示"必须"，前接动词ない形。'],
  ['日本語が___。', ['話せます', '話します', '話させます'], 0, '可能形：話す → 話せる，"会说日语"。'],
]

const JA_LISTENING: ListeningTuple[] = [
  ['次の電車は三番ホームから九時十五分に出発します。', '電車は何番ホームから出ますか？', ['3 番ホーム', '5 番ホーム', '9 番ホーム'], 0],
  ['砂糖は入れないで、ミルクだけのコーヒーをお願いします。', 'どんなコーヒーを頼みましたか？', ['ミルクだけ', '砂糖だけ', '何も入れない'], 0],
  ['トムさんはいつもはジムに行きますが、今日は泳ぎに行きました。', 'トムさんは今日何をしましたか？', ['泳いだ', 'ジムに行った', '走った'], 0],
  ['まっすぐ行って、二つ目の角を左に曲がってください。', '郵便局への行き方は？', ['直走后第二个路口左转', '先右转再直走', '坐公交去'], 0],
  ['会議は月曜日の朝から水曜日の午後に変更になりました。', '会議はいつになりましたか？', ['水曜日の午後', '月曜日の朝', '金曜日の午後'], 0],
  ['スマホの充電がほとんどないので、充電器を探しています。', '何を探していますか？', ['充電器', '新しいスマホ', 'モバイルバッテリー'], 0],
]

const JA_SPEAKING: SpeakingTuple[] = [
  ['はじめまして、よろしくお願いします。', '初次见面，请多关照。', 'はじめまして 语调平稳，お願いします 礼貌庄重。'],
  ['ありがとうございます。とても助かりました。', '非常感谢，帮了大忙。', 'ます 结尾清晰，比单用ありがとう更正式。'],
  ['すみません、もう一度ゆっくりお願いします。', '不好意思，请再慢说一遍。', 'ゆっくり 促音顿挫，整句用敬体显礼貌。'],
  ['サンドイッチとオレンジジュースをお願いします。', '请给我三明治和橙汁。', 'と 连接并列商品，お願いします 收尾点单。'],
  ['すみません、一番近い駅はどこですか。', '请问最近的车站在哪里？', 'どこですか 句末轻微升调。'],
  ['週末はたいてい何をしていますか。', '你周末一般做什么？', 'たいてい 意为"大致、通常"，ています 表习惯。'],
  ['日本語を六か月ぐらい勉強しています。', '我学日语大约六个月了。', 'ぐらい 表约略数量，ています 表持续动作。'],
  ['今日はいい天気ですね。', '今天天气真好啊。', 'ね 是寻求附和的终助词，读升调。'],
]

// ================= 韩语语料 =================
const KO_WORDS: WordTuple[] = [
  ['안녕하세요', 'annyeonghaseyo', '你好', '안녕하세요, 만나서 반갑습니다.', '你好，见到你很高兴。'],
  ['감사합니다', 'gamsahamnida', '谢谢', '도와주셔서 감사합니다.', '感谢您的帮助。'],
  ['안녕히 가세요', 'annyeonghi gaseyo', '再见（对离开的人）', '안녕히 가세요, 내일 봐요!', '再见，明天见！'],
  ['네', 'ne', '是；对', '네, 알겠습니다.', '好的，我知道了。'],
  ['아니요', 'aniyo', '不；不是', '아니요, 괜찮아요.', '不，没关系。'],
  ['좋은 아침', 'joeun achim', '早上好', '좋은 아침이에요!', '早上好！'],
  ['친구', 'chingu', '朋友', '그녀는 제 친구예요.', '她是我的朋友。'],
  ['물', 'mul', '水', '물 한 잔 주세요.', '请给我一杯水。'],
  ['책', 'chaek', '书', '이 책은 아주 재미있어요.', '这本书很有趣。'],
  ['먹다', 'meokda', '吃', '저는 저녁을 일곱 시에 먹어요.', '我七点吃晚饭。'],
  ['마시다', 'masida', '喝', '저는 매일 아침 차를 마셔요.', '我每天早上喝茶。'],
  ['사랑', 'sarang', '爱', '음악을 사랑해요.', '我热爱音乐。'],
  ['가족', 'gajok', '家庭；家人', '가족이 여섯 명이에요.', '我家有六口人。'],
  ['학교', 'hakgyo', '学校', '학교가 집에서 가까워요.', '学校离家很近。'],
  ['선생님', 'seonsaengnim', '老师', '우리 선생님은 친절하세요.', '我们的老师很亲切。'],
  ['학생', 'haksaeng', '学生', '그는 부지런한 학생이에요.', '他是个勤奋的学生。'],
  ['시간', 'sigan', '时间', '시간이 없어요.', '没有时间了。'],
  ['오늘', 'oneul', '今天', '오늘은 날씨가 좋아요.', '今天天气很好。'],
  ['내일', 'naeil', '明天', '내일 아침에 봐요.', '明天早上见。'],
  ['집', 'jip', '家', '집에 가요.', '回家。'],
  ['도시', 'dosi', '城市', '서울은 큰 도시예요.', '首尔是一座大城市。'],
  ['음식', 'eumsik', '食物', '여기 음식이 맛있어요.', '这里的食物好吃。'],
  ['빵', 'ppang', '面包', '아침으로 빵을 먹어요.', '早餐吃面包。'],
  ['커피', 'keopi', '咖啡', '커피 한 잔 주세요.', '请来杯咖啡。'],
  ['여행', 'yeohaeng', '旅行', '해외여행을 좋아해요.', '我喜欢海外旅行。'],
  ['공항', 'gonghang', '机场', '공항까지 지하철로 가요.', '坐地铁去机场。'],
  ['표', 'pyo', '票', '표를 인터넷으로 샀어요.', '我在网上买了票。'],
  ['호텔', 'hotel', '酒店', '작은 호텔에서 묵었어요.', '住在一家小酒店。'],
  ['날씨', 'nalssi', '天气', '날씨 예보를 들어요.', '听天气预报。'],
  ['비', 'bi', '雨', '오후에 비가 와요.', '下午下雨。'],
  ['일', 'il', '工作', 'IT 회사에서 일해요.', '我在IT公司工作。'],
  ['회사', 'hoesa', '公司', '회사가 역 근처예요.', '公司在车站附近。'],
  ['회의', 'hoeui', '会议', '회의는 열 시에 시작해요.', '会议十点开始。'],
  ['이메일', 'imeil', '邮件', '이메일을 보내 주세요.', '请给我发邮件。'],
  ['전화', 'jeonhwa', '电话', '전화를 받아요.', '接电话。'],
  ['돈', 'don', '钱', '여행을 위해 돈을 모아요.', '为旅行攒钱。'],
  ['환경', 'hwangyeong', '环境', '환경을 보호해야 해요.', '必须保护环境。'],
  ['문화', 'munhwa', '文化', '한국 문화에 관심이 있어요.', '我对韩国文化感兴趣。'],
  ['역사', 'yeoksa', '历史', '중국 역사는 길어요.', '中国历史悠久。'],
  ['경험', 'gyeongheom', '经验', '소중한 경험을 했어요.', '获得了宝贵经验。'],
  ['결정', 'gyeoljeong', '决定', '어려운 결정을 내렸어요.', '做出了艰难的决定。'],
  ['기회', 'gihoe', '机会', '좋은 기회예요.', '是个好机会。'],
  ['책임', 'chaegim', '责任', '책임을 지고 일해요.', '负责任地工作。'],
  ['철학', 'cheolhak', '哲学', '동양 철학을 좋아해요.', '我喜欢东方哲学。'],
  ['복잡하다', 'bokjaphada', '复杂的', '이 시스템은 복잡해요.', '这个系统很复杂。'],
]

const KO_GRAMMAR: GrammarTuple[] = [
  ['저___ 학생입니다.', ['은', '는', '이', '가'], 1, '저 是开音节以元音结尾，主题助词用 는。'],
  ['밥___ 먹어요.', ['을', '를', '이', '가'], 0, '밥 有收音 ㅂ，宾语助词用 을；无收音的名词后才用 를。'],
  ['어제 영화를___.', ['봐요', '봤어요', '볼 거예요'], 1, '어제（昨天）是过去时间，用过去式 -았/었어요。'],
  ['한국어___ 말해요.', ['를', '은', '에', '의'], 0, '한국어 无收音，宾语助词用 를。'],
  ['이것___ 누구 책이에요?', ['은', '는', '이', '가'], 0, '이것 有收音 ㅅ，主题助词用 은。'],
  ['학교___ 가요.', ['에서', '에', '을', '와'], 1, '에 表示目的地，"去学校"是 학교에 가다。'],
  ['내일 친구를___.', ['만나요', '만날 거예요', '만났어요'], 1, '내일（明天）是将来，用 -(으)ㄹ 거예요。'],
  ['비가 오___ 놀러 갔어요.', ['지만', '고', '으면'], 0, '-지만 表示转折"虽然……但是"。'],
  ['조용히___.', ['하세요', '해라', '한다'], 0, '-(으)세요 构成礼貌祈使句，"请安静"。'],
  ['한국 음식을 먹어___.', ['봤어요', '했어요', '갔어요'], 0, '-아/어 보다 表经历，"吃过（尝试过）韩餐"。'],
]

const KO_LISTENING: ListeningTuple[] = [
  ['다음 기차는 3번 승강장에서 9시 15분에 출발합니다.', '기차는 몇 번 승강장에서 출발해요?', ['3 번', '5 번', '9 번'], 0],
  ['설탕은 넣지 말고 우유만 넣은 커피로 주세요.', '어떤 커피를 시켰어요?', ['우유만 넣은 커피', '설탕만 넣은 커피', '아무것도 안 넣은 커피'], 0],
  ['톰은 보통 퇴근 후 체육관에 가지만 오늘은 수영하러 갔어요.', '톰은 오늘 뭐 했어요?', ['수영', '체육관', '달리기'], 0],
  ['쭉 가서 두 번째 사거리에서 왼쪽으로 돌으세요.', '우체국에 어떻게 가요?', ['直走后第二个路口左转', '先右转再直走', '버스를 타요'], 0],
  ['회의가 월요일 아침에서 수요일 오후로 변경되었습니다.', '회의가 언제로 바뀌었어요?', ['수요일 오후', '월요일 아침', '금요일 오후'], 0],
  ['휴대폰 배터리가 거의 없어서 충전기를 찾아야 해요.', '무엇을 찾아야 해요?', ['충전기', '새 휴대폰', '보조배터리'], 0],
]

const KO_SPEAKING: SpeakingTuple[] = [
  ['안녕하세요, 만나서 반갑습니다.', '你好，见到你很高兴。', '안녕하세요 连贯流畅，습니다 收尾庄重礼貌。'],
  ['도와주셔서 정말 감사합니다.', '非常感谢您的帮助。', '도와주셔서 是"帮助我"的敬语过去式。'],
  ['죄송한데 좀 천천히 다시 말씀해 주세요.', '抱歉，请稍慢再讲一遍。', '말씀하다 是"说话"的敬语，整句用委婉句式。'],
  ['샌드위치 하나와 오렌지 주스 한 잔 주세요.', '请给我一个三明治和一杯橙汁。', '数词后接单位：하나 配汉字量词时变为 한 잔。'],
  ['실례합니다, 가장 가까운 지하철역이 어디예요?', '请问最近的地铁站在哪里？', '실례합니다 用于搭话，어디예요 轻升调。'],
  ['주말에 보통 뭐 해요?', '周末一般做什么？', '보통 意为"通常"，해요 是口语缩略形。'],
  ['한국어를 약 6개월 동안 배우고 있어요.', '我学韩语大约六个月了。', '-고 있어요 表动作正在持续，相当于"正在学"。'],
  ['오늘 날씨 정말 좋네요, 그렇죠?', '今天天气真好，是吧？', '네요 表感叹，그렇죠? 用于寻求附和。'],
]

// ================= 课程结构元信息 =================
interface UnitMeta {
  title: string
  lessons: [string, string][] // [标题, 简介]
}

const COURSE_STRUCTURE: UnitMeta[][] = [
  // 入门
  [
    { title: '问候与寒暄', lessons: [['初次见面', '学习最基础的问候与自我介绍'], ['日常问候', '早中晚问候与简单应答']] },
    { title: '基础表达', lessons: [['是与否', '肯定、否定与礼貌回应'], ['感谢与道别', '表达感谢、道歉与告别']] },
    { title: '身边事物', lessons: [['食物与饮品', '水、面包与咖啡'], ['我的朋友', '介绍朋友与表达喜好']] },
  ],
  // 初级
  [
    { title: '我的生活', lessons: [['我的家庭', '介绍家庭成员'], ['在学校', '老师、学生与校园']] },
    { title: '时间与地点', lessons: [['今天和明天', '谈论时间与日期'], ['我的城市', '房子、街道与生活圈']] },
    { title: '饮食日常', lessons: [['一日三餐', '常见食物与进食表达'], ['咖啡时光', '点单与饮品话题']] },
  ],
  // 中级
  [
    { title: '出行准备', lessons: [['计划旅行', '谈论旅行计划'], ['机场与车票', '订票、出发与交通']] },
    { title: '旅居在外', lessons: [['入住酒店', '住宿登记与需求'], ['天气闲聊', '天气预报与寒暄']] },
    { title: '职场入门', lessons: [['公司与会议', '工作场所与会议安排'], ['邮件与电话', '商务沟通基础']] },
  ],
  // 高级
  [
    { title: '社会议题', lessons: [['环境与责任', '讨论环保议题'], ['文化与历史', '谈论文化差异']] },
    { title: '抽象表达', lessons: [['经验与决定', '讲述经历与抉择'], ['机会与挑战', '表达观点与态度']] },
    { title: '观点表达', lessons: [['表达立场', '同意、反对与补充'], ['深入讨论', '复杂句型下的论证']] },
  ],
  // 精通
  [
    { title: '思想与语言', lessons: [['哲学思辨', '抽象概念的精准表达'], ['复杂表达', '长难句与高级词汇']] },
    { title: '专业沟通', lessons: [['商务谈判', '高级商务场景对话'], ['演讲展示', '公开表达与逻辑组织']] },
    { title: '母语者世界', lessons: [['新闻精读', '真实新闻听力与词汇'], ['文学赏析', '修辞、隐喻与风格']] },
  ],
]

interface Corpus {
  words: WordTuple[]
  grammar: GrammarTuple[]
  listening: ListeningTuple[]
  speaking: SpeakingTuple[]
}

const CORPORA: Record<LanguageCode, Corpus> = {
  en: { words: EN_WORDS, grammar: EN_GRAMMAR, listening: EN_LISTENING, speaking: EN_SPEAKING },
  ja: { words: JA_WORDS, grammar: JA_GRAMMAR, listening: JA_LISTENING, speaking: JA_SPEAKING },
  ko: { words: KO_WORDS, grammar: KO_GRAMMAR, listening: KO_LISTENING, speaking: KO_SPEAKING },
}

function pickCyclic<T>(arr: T[], start: number, count: number): T[] {
  const out: T[] = []
  for (let i = 0; i < count; i++) out.push(arr[(start + i) % arr.length])
  return out
}

function buildLessons(code: LanguageCode): Lesson[] {
  const corpus = CORPORA[code]
  const lessons: Lesson[] = []

  COURSE_STRUCTURE.forEach((units, level) => {
    units.forEach((unitMeta, unit) => {
      unitMeta.lessons.forEach(([title, summary], order) => {
        const globalIdx = level * 6 + unit * 2 + order // 0..29
        const wordTuples = pickCyclic(corpus.words, (globalIdx * 3) % corpus.words.length, 5)
        const words: Word[] = wordTuples.map((t, i) => ({
          id: `${code}-w${corpus.words.indexOf(t)}`,
          text: t[0],
          phonetic: t[1],
          meaning: t[2],
          example: t[3],
          exampleZh: t[4],
        }))
        const g1 = corpus.grammar[globalIdx % corpus.grammar.length]
        const g2 = corpus.grammar[(globalIdx + 3) % corpus.grammar.length]
        const grammar: GrammarQuestion[] = [g1, g2].map((g, i) => ({
          id: `${code}-g${globalIdx}-${i}`,
          prompt: g[0],
          options: g[1],
          answer: g[2],
          explanation: g[3],
        }))
        const lq = corpus.listening[globalIdx % corpus.listening.length]
        const listening: ListeningQuestion = {
          id: `${code}-lis${globalIdx}`,
          audioText: lq[0],
          title: lq[1],
          options: lq[2],
          answer: lq[3],
        }
        const sq = corpus.speaking[globalIdx % corpus.speaking.length]
        const speaking: SpeakingSentence = {
          id: `${code}-sp${globalIdx}`,
          text: sq[0],
          zh: sq[1],
          tip: sq[2],
        }
        lessons.push({
          id: `${code}-l${level}-u${unit}-${order}`,
          lang: code,
          level,
          unit,
          order,
          title,
          summary,
          words,
          grammar,
          listening,
          speaking,
        })
      })
    })
  })
  return lessons
}

export const LESSONS: Record<LanguageCode, Lesson[]> = {
  en: buildLessons('en'),
  ja: buildLessons('ja'),
  ko: buildLessons('ko'),
}

export const getLesson = (id: string): Lesson | undefined =>
  Object.values(LESSONS).flat().find((l) => l.id === id)

/** 某语言全部单词（用于单词记忆模块的自由练习） */
export const ALL_WORDS: Record<LanguageCode, Word[]> = {
  en: EN_WORDS.map((t, i) => ({
    id: `en-w${i}`, text: t[0], phonetic: t[1], meaning: t[2], example: t[3], exampleZh: t[4],
  })),
  ja: JA_WORDS.map((t, i) => ({
    id: `ja-w${i}`, text: t[0], phonetic: t[1], meaning: t[2], example: t[3], exampleZh: t[4],
  })),
  ko: KO_WORDS.map((t, i) => ({
    id: `ko-w${i}`, text: t[0], phonetic: t[1], meaning: t[2], example: t[3], exampleZh: t[4],
  })),
}

export const SKILL_META: { key: 'vocab' | 'grammar' | 'listening' | 'speaking'; name: string; icon: string; desc: string; color: string }[] = [
  { key: 'vocab', name: '单词记忆', icon: '🃏', desc: '闪卡记忆 + 间隔复习', color: '#6366f1' },
  { key: 'grammar', name: '语法练习', icon: '✏️', desc: '选择填空 + 即时解析', color: '#f59e0b' },
  { key: 'listening', name: '听力训练', icon: '🎧', desc: '母语级语音合成听力', color: '#10b981' },
  { key: 'speaking', name: '口语跟读', icon: '🎙️', desc: '语音识别实时打分', color: '#ec4899' },
]
