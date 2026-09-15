import { createContext } from "react";

export type Locale = "fa" | "en";
export type Direction = "rtl" | "ltr";

export const LOCALES: Locale[] = ["fa", "en"];
export const DEFAULT_LOCALE: Locale = "fa";
export const LOCALE_STORAGE_KEY = "intake.locale";

/* -------------------------------------------------------------------------- */
/* Persian: the primary language of the workspace.                            */
/* -------------------------------------------------------------------------- */

const fa = {
  brand: {
    name: "Intake",
    tagline: "تیکتینگ داخلی",
  },
  common: {
    newTicket: "تیکت جدید",
    new: "جدید",
    cancel: "انصراف",
    loading: "در حال بارگذاری…",
    unassigned: "بدون مسئول",
    ticketsCount: "{count} تیکت",
    browseCatalog: "مرور فهرست تیکتها",
  },
  language: {
    label: "زبان",
    fa: "فارسی",
    en: "English",
  },
  nav: {
    dashboard: "داشبورد",
    catalog: "فهرست تیکتها",
    admin: "مدیریت",
  },
  role: {
    owner: "مالک فضای کاری",
    member: "عضو فضای کاری",
    signOut: "خروج از حساب",
  },
  status: {
    open: { label: "باز", hint: "ثبت شده و هنوز کسی سراغش نرفته" },
    pending: { label: "در انتظار", hint: "پاسخ داده شده و منتظر درخواستدهنده" },
    resolved: { label: "حلشده", hint: "انجام شده و تأیید شده" },
    closed: { label: "بسته", hint: "بایگانی شده برای مراجعه بعدی" },
  },
  priority: {
    low: { label: "کم", hint: "هر وقت فرصت بود" },
    normal: { label: "معمولی", hint: "ترتیب عادی صف" },
    high: { label: "بالا", hint: "کار کسی را متوقف کرده" },
    urgent: { label: "فوری", hint: "بقیه کارها متوقف شود" },
  },
  filters: {
    all: "همه",
    allPriorities: "همه اولویتها",
    anyOwner: "همه مسئولها",
    mine: "واگذارشده به من",
    unassigned: "بدون مسئول",
    clear: "پاک کردن فیلترها",
  },
  catalog: {
    title: "فهرست تیکتها",
    description: "همه تیکتهایی که تیم ثبت کرده، قابل جستوجو در یک جا.",
    search: "جستوجو در عنوان، شناسه یا مسئول",
    columnTicket: "تیکت",
    columnOwner: "مسئول",
    columnPriority: "اولویت",
    columnStatus: "وضعیت",
    columnUpdated: "آخرین تغییر",
    loggedBy: "ثبتشده توسط {name}",
    emptyFiltered: "تیکتی با این فیلترها پیدا نشد",
    emptyNone: "هنوز تیکتی در فهرست نیست",
    emptyFilteredHint: "وضعیت، اولویت، مسئول یا عبارت جستوجو را تغییر دهید.",
    emptyNoneHint: "اولین تیکت را ثبت کنید یا یک صف نمونه بارگذاری کنید.",
    loadSample: "بارگذاری تیکتهای نمونه",
    onRecord: "{count} تیکت در فهرست",
    matching: "{count} تیکت مطابق فیلترها",
  },
  ticket: {
    missing: "این تیکت دیگر وجود ندارد یا لینک قدیمی است.",
    request: "درخواست",
    openedAt: "ثبتشده در {date}",
    attachments: "پیوستها",
    download: "دانلود",
    discussion: "گفتگو",
    noComments: "هنوز نظری ثبت نشده — گفتگو را شروع کنید",
    commentCount: "{count} نظر",
    addComment: "افزودن نظر",
    commentPlaceholder: "یافتهها، مانع یا قدم بعدی را بنویسید.",
    postComment: "ثبت نظر",
    commentHint:
      "نظر ثبتکننده تیکت را باز میکند و نظر بقیه آن را در انتظار میگذارد. ثبت سریع: ⌘/Ctrl + Enter",
    triage: "رسیدگی",
    triageHint: "وضعیت و اولویت تعیین میکنند صف چه چیزی را اول نشان دهد",
    ownerOwned: "این همتیمی قدم بعدی را برمیدارد.",
    ownerNone: "هنوز کسی مسئول این تیکت نیست.",
    markResolved: "علامتگذاری بهعنوان حلشده",
    reopen: "بازگشایی بهعنوان باز",
    addTodo: "افزودن به کارهای من",
    details: "جزئیات",
    detailsHint: "چه کسی ثبت کرد و از آن زمان چه شد",
    noEmail: "ایمیلی ثبت نشده",
    opened: "زمان ثبت",
    lastActivity: "آخرین فعالیت",
    firstResponse: "اولین پاسخ",
    firstResponsePending: "در انتظار",
    comments: "نظرات",
    files: "فایلها",
    backToCatalog: "فهرست تیکتها",
    you: "شما",
    followUpTodo: "پیگیری: {subject}",
  },
  newTicket: {
    title: "تیکت جدید",
    description: "درخواست را با هر چیزی که برای رسیدگی لازم است ثبت کنید.",
    cardTitle: "مشخصات تیکت",
    cardHint: "هر تیکت برای یک موضوع، تا فهرست قابل جستوجو بماند.",
    titleLabel: "عنوان",
    titlePlaceholder: "خلاصه کوتاه و دقیق درخواست",
    detailsLabel: "توضیحات",
    detailsPlaceholder:
      "انتظار داشتید چه شود، چه شد و تا حالا چه چیزی را امتحان کردهاید.",
    detailsHint: "توضیح بیشتر، رفتوبرگشت کمتری میسازد.",
    chars: "{count} کاراکتر",
    ownerLabel: "مسئول",
    ownerHint: "اختیاری. اگر خالی بماند، هر کسی میتواند از فهرست برش دارد.",
    attachmentsLabel: "پیوستها",
    chooseFiles: "انتخاب فایل",
    filesHint: "تصویر، لاگ یا سند — تا ۵ فایل، هر کدام ۱۰ مگابایت",
    removeFile: "حذف {name}",
    defaults: "تیکت جدید با وضعیت باز و اولویت معمولی وارد فهرست میشود.",
    create: "ایجاد تیکت",
    uploadingOne: "بارگذاری {name}…",
    uploadingMany: "بارگذاری فایل {current} از {total}…",
    creating: "در حال ایجاد تیکت…",
    goodTitle: "یک تیکت خوب چه دارد؟",
    goodOne: "عنوانی که در فهرستی پنجاهتایی هم قابل تشخیص باشد.",
    goodTwo: "مراحل بازتولید، لینکها یا متن دقیق خطا.",
    goodThree: "مهلت زمانی، اگر وجود دارد، تا اولویت روشن باشد.",
    afterTitle: "بعد از ثبت",
    afterBody:
      "به صفحه خود تیکت میرسید. هر کسی در تیم میتواند همانجا نظر بگذارد و سرنخ اضافه کند و تیکت در داشبورد شما هم دیده میشود.",
    tooLarge: "هر فایل باید کمتر از ۱۰ مگابایت باشد.",
    tooMany: "حداکثر {max} فایل میتوانید پیوست کنید.",
    needTitle: "عنوان تیکت را بنویسید؛ حداقل ۴ کاراکتر.",
    needDetails: "توضیح درخواست را بنویسید؛ حداقل ۱۰ کاراکتر.",
  },
  dashboard: {
    title: "داشبورد",
    description: "تیکتهای شما، کارهای شما و آنچه منتظر شماست.",
    assignedToMe: "واگذارشده به من",
    assignedToMeHint: "تیکتهای باز با نام شما",
    myOpen: "بازهای من",
    myOpenHint: "تیکتهایی که ثبت کردهاید و کار دارند",
    waiting: "در انتظار",
    waitingHint: "پاسخ داده شده و منتظر دیگری",
    openTodos: "کارهای باز",
    openTodosHint: "در فهرست شخصی شما",
    assignedCard: "واگذارشده به شما",
    assignedCount: "{count} تیکت باز با نام شما",
    assignedNone: "الان چیزی منتظر شما نیست",
    inboxZero: "کارتابل خالی است",
    inboxZeroHint:
      "تیکتها بعد از برداشتن کار اینجا میآیند. از فهرست هر تیکت بیصاحب را بردارید.",
    findWork: "چیزی برای برداشتن پیدا کنید",
    myTickets: "تیکتهای من",
    myTicketsTotal: "{total} تیکت ثبتشده · {done} بستهشده",
    myTicketsNone: "هنوز چیزی به نام شما ثبت نشده",
    noTickets: "هنوز تیکتی نیست",
    noTicketsHint:
      "چیزی که منتظرش هستید ثبت کنید تا اینجا و در فهرست دیده شود.",
    todos: "کارها",
    todoSummary: "{open} باز · {done} انجامشده",
    todoAdd: "افزودن کار",
    todoEmpty:
      "فهرست خالی است. کارها خصوصی شما هستند؛ برای پیگیریهایی که تیکت جدا لازم ندارند.",
    todoAdded: "ثبتشده {time}",
    todoLinked: " · متصل به تیکت",
    markDone: "علامتگذاری بهعنوان انجامشده",
    markNotDone: "برداشتن علامت انجامشده",
    deleteTodo: "حذف کار",
    teamCard: "وضعیت تیم",
    teamHint: "کل صف، نه فقط سهم شما",
    teamOpen: "باز",
    teamOpenHint: "هنوز پاسخی نگرفته",
    teamWaiting: "در انتظار",
    teamWaitingHint: "منتظر یک نفر",
    teamUrgent: "فوری",
    teamUrgentHint: "بالا یا فوری و باز",
    teamUnassigned: "بدون مسئول",
    teamUnassignedHint: "هنوز مسئول ندارد",
  },
  admin: {
    title: "مدیریت",
    description: "تصویر کلی تیم و همه تیکتها، قابل ویرایش در همانجا.",
    open: "باز",
    openHint: "هنوز پاسخی نگرفته",
    waitingHint: "پاسخ داده شده و منتظر درخواستدهنده",
    attention: "نیازمند توجه",
    attentionHint: "بالا یا فوری و حلنشده",
    resolvedWeek: "حلشده در این هفته",
    resolvedWeekHint: "بستهشده در ۷ روز گذشته",
    emptyTitle: "فضای کاری خالی است",
    emptyBody:
      "ده تیکت واقعی بارگذاری کنید تا آمار، صف و گفتگوها را در عمل ببینید. داده نمونه فقط وقتی اضافه میشود که فهرست خالی باشد.",
    loadSample: "بارگذاری تیکتهای نمونه",
    volume: "حجم تیکتها",
    volumeHint: "تیکتهای ثبتشده در هر روز، در دو هفته گذشته",
    queue: "صف",
    queueHint: "تیکتهای حلنشده، بر اساس آخرین فعالیت",
    queueClear: "صف خالی است",
    queueClearHint: "همه تیکتها حل یا بسته شدهاند.",
    health: "سلامت پاسخدهی",
    healthHint: "بر اساس همه تیکتهای ثبتشده",
    medianResponse: "میانه اولین پاسخ",
    oldestWaiting: "قدیمیترین تیکت بیپاسخ",
    none: "ندارد",
    onRecord: "کل تیکتها",
    unassignedStat: "بدون مسئول",
    allTickets: "همه تیکتها",
    allTicketsHint:
      "وضعیت یا اولویت را همانجا عوض کنید یا هر چه لازم نیست را حذف کنید",
    noneToManage: "تیکتی برای مدیریت نیست.",
    deleteAria: "حذف {reference}",
    deleteTitle: "حذف {reference}؟",
    deleteBody:
      "«{subject}» با نظرات و پیوستهایش برای همه حذف میشود. این کار برگشتپذیر نیست.",
    keepIt: "نگهش دار",
    delete: "حذف تیکت",
    queueNone: "الان چیز حلنشدهای نیست",
    chartLogged: "ثبتشده",
    chartTickets: "{count} تیکت",
  },
  landing: {
    signIn: "ورود",
    overline: "سامانه تیکتینگ داخلی",
    navCapabilities: "قابلیتها",
    navWorkflow: "روند کار",
    navDesk: "میز کار",
    heroTitle: "هر درخواستی که تیم بدهکار است",
    heroAccent: "، در یک صفِ مرتب",
    heroBody:
      "Intake یک میز تیکت خصوصی برای تیمهای چندنفره است. درخواست را ثبت کنید، در همان صفحه گفتگو کنید، فایل توضیحدهنده را پیوست کنید و فهرست کارهای شخصی خودتان را کنار همان کارها نگه دارید.",
    ctaPrimary: "ورود یا ساخت حساب",
    ctaSecondary: "قابلیتها را ببینید",
    factCode: "ورود با کد یکبارمصرف",
    factSearch: "جستوجو در همه تیکتها",
    factFiles: "پیوست تا ۱۰ مگابایت",
    previewTitle: "فهرست",
    previewCount: "۱۰ تیکت",
    previewOpen: "باز",
    previewWaiting: "در انتظار",
    previewResolved: "حلشده",
    previewUrgent: "فوری",
    previewRowOne: "چرخش کلیدهای API محیط استیجینگ تا جمعه",
    previewRowTwo: "راهنمای انتشار بهروز نیست",
    previewRowThree: "ورود فایلهای بزرگتر از ۵ مگابایت انجام نمیشود",
    previewCommentName: "نگار محمدی",
    previewCommentInitials: "نم",
    previewCommentTime: "۲ ساعت پیش",
    previewCommentBody:
      "روی سیستم من هم همین اتفاق میافتد. بارگذار هر فایل بیشتر از ۵ مگابایت را رد میکند، پس محدودیت را روی شاخهام به ۲۰ مگابایت رساندم.",
    previewFile: "deploy-log.txt",
    previewSize: "۱۲۸ کیلوبایت",
    previewQuery: "select * from tickets order by last_activity_at desc;",
    capabilitiesOverline: "قابلیتها",
    capabilitiesTitle: "هر چه یک تیم کوچک لازم دارد",
    capabilitiesBody:
      "حساب کاربری، فهرست قابل جستوجو، صفحه اختصاصی هر تیکت، پیوست فایل، نظر، کارهای شخصی و بخش مدیریت. چیز دیگری برای پرت کردن حواس نیست.",
    capabilityOneTitle: "ورود در یک دقیقه",
    capabilityOneBody:
      "با ایمیل کاری وارد شوید و کد یکبارمصرف بگیرید. رمزی برای ساختن، نگهداشتن یا عوض کردن وجود ندارد.",
    capabilityTwoTitle: "مرور فهرست تیکتها",
    capabilityTwoBody:
      "هر تیکتی که تیم ثبت کرده، بر اساس وضعیت و آخرین اتفاق مرتب شده است.",
    capabilityThreeTitle: "جستوجویی که پیدایش میکند",
    capabilityThreeBody:
      "بر اساس عنوان، شناسه، ثبتکننده یا آخرین نظر جستوجو کنید و با وضعیت و اولویت محدودش کنید.",
    capabilityFourTitle: "ثبت و بارگذاری",
    capabilityFourBody:
      "تیکت را با تصویر، لاگ یا سند باز کنید؛ تا پنج فایل، هر کدام ۱۰ مگابایت.",
    capabilityFiveTitle: "گفتگو در متن تیکت",
    capabilityFiveBody:
      "گفتگو روی خود تیکت میماند، پس کسی مجبور نیست ماجرا را بعداً از ایمیلها بازسازی کند.",
    capabilitySixTitle: "داشبورد شخصی",
    capabilitySixBody:
      "تیکتهایی که ثبت کردهاید، کارهایی که منتظر شماست و فهرست کارهای خصوصی.",
    workflowOverline: "روند کار",
    workflowTitle: "از درخواست تا سابقه، در سه قدم",
    workflowOneTitle: "ثبت درخواست",
    workflowOneBody:
      "عنوان و توضیحات را بنویسید و فایلهای لازم را پیوست کنید. تیکت با وضعیت باز وارد فهرست میشود.",
    workflowTwoTitle: "رسیدگی و اولویتبندی",
    workflowTwoBody:
      "وضعیت و اولویت را از صفحه تیکت یا مستقیم در جدول مدیریت عوض کنید. صف خودش بازمرتب میشود.",
    workflowThreeTitle: "بستن پرونده",
    workflowThreeBody:
      "در حین کار نظر بگذارید و در پایان حلشده کنید؛ گفتگو سابقهای قابل جستوجو میماند.",
    deskOverline: "برای کسی که کشیک است",
    manageTitle: "همهچیز را از بخش مدیریت بچرخانید",
    manageBody:
      "اول اعداد تیم: حجم روزانه، کارهای حلنشده، میانه اولین پاسخ و تیکتهایی که بیشتر از همه معطل ماندهاند.",
    manageOne: "تغییر وضعیت و اولویت روی همان ردیف، بدون رفتن به صفحه دیگر.",
    manageTwo: "حذف تیکتهای اشتباه همراه با نظرات و فایلهایشان.",
    manageThree: "همه صفحهها پشت حساب کاربری هستند، پس فهرست عمومی نیست.",
    ownTitle: "کارهای خودتان را هم پیگیری کنید",
    ownBody:
      "داشبورد شما همان بخش کوچکی است که به خودتان مربوط است: تیکتهایی که باز کردهاید، آنچه منتظر دیگری است و کارهایی که تیکت جدا لازم نداشتند.",
    ownOne: "اعداد با حرکت صف بهروز میشوند، چون از همان داده میخوانند.",
    ownTwo: "کارها خصوصی شما هستند و میتوانند به یک تیکت وصل شوند.",
    ownThree:
      "نظر ثبتکننده تیکت را باز میکند و نظر دیگران آن را در انتظار میگذارد.",
    ctaOverline: "خصوصی بهصورت پیشفرض",
    ctaTitle: "به تیم یک میز بدهید، فهرست را خصوصی نگه دارید",
    ctaBody:
      "با ایمیل کاری وارد شوید و Intake همان لحظه حساب شما را میسازد. تیکتها، نظرات و کارها فقط برای اعضای واردشده دیده میشوند.",
    ctaFinalPrimary: "ورود یا ساخت حساب",
    ctaFinalSecondary: "رفتن به بخش مدیریت",
  },
  auth: {
    title: "ورود به Intake",
    description:
      "ایمیل کاریتان را وارد کنید تا کد یکبارمصرف بفرستیم. اولین ورود، حساب شما را میسازد.",
    emailPlaceholder: "name@example.com",
    guest: "ورود بهعنوان مهمان",
    checkEmail: "ایمیل خود را بررسی کنید",
    codeSent: "کد به {email} فرستاده شد",
    verify: "تأیید کد",
    verifying: "در حال بررسی…",
    differentEmail: "استفاده از ایمیل دیگر",
    noCode: "کدی دریافت نکردید؟",
    tryAgain: "تلاش دوباره",
    invalidCode: "کد وارد شده درست نیست.",
    sendFailed: "ارسال کد ناموفق بود. دوباره تلاش کنید.",
    guestFailed: "ورود مهمان ناموفق بود: {message}",
    securedBy: "محافظتشده توسط",
  },
  notFound: {
    overline: "خطای ۴۰۴",
    title: "در این نشانی چیزی نیست",
    body: "شاید لینک قدیمی است یا تیکتی که به آن اشاره داشت حذف شده.",
    dashboard: "بازگشت به داشبورد",
    catalog: "مرور فهرست تیکتها",
  },
  toasts: {
    ticketCreated: "تیکت {reference} ساخته شد",
    commentPosted: "نظر ثبت شد",
    todoAdded: "به کارهای شما اضافه شد",
    todoOpen: "باز کردن داشبورد",
    statusSet: "وضعیت به «{status}» تغییر کرد",
    prioritySet: "اولویت به «{priority}» تغییر کرد",
    ownerUpdated: "مسئول تغییر کرد",
    ownerCleared: "مسئول برداشته شد",
    sampleLoaded: "{count} تیکت نمونه بارگذاری شد",
    sampleExists: "فهرست از قبل تیکت دارد",
    deleted: "{reference} حذف شد",
  },
  errors: {
    generic: "انجام نشد. دوباره تلاش کنید.",
    uploadFailed: "بارگذاری {name} ناموفق بود.",
    createTicket: "ساخت تیکت ناموفق بود.",
    postComment: "ثبت نظر ناموفق بود.",
    updateStatus: "تغییر وضعیت ناموفق بود.",
    updatePriority: "تغییر اولویت ناموفق بود.",
    updateOwner: "تغییر مسئول ناموفق بود.",
    addTodo: "افزودن کار ناموفق بود.",
    updateTodo: "بهروزرسانی کار ناموفق بود.",
    deleteTodo: "حذف کار ناموفق بود.",
    loadSample: "بارگذاری تیکتهای نمونه ناموفق بود.",
    deleteTicket: "حذف تیکت ناموفق بود.",
  },
};

export type Dictionary = typeof fa;

/* -------------------------------------------------------------------------- */
/* English: the same catalogue, for teammates who work in English.            */
/* -------------------------------------------------------------------------- */

const en: Dictionary = {
  brand: {
    name: "Intake",
    tagline: "internal ticketing",
  },
  common: {
    newTicket: "New ticket",
    new: "New",
    cancel: "Cancel",
    loading: "Loading...",
    unassigned: "Unassigned",
    ticketsCount: "{count} tickets",
    browseCatalog: "Browse the catalog",
  },
  language: {
    label: "Language",
    fa: "فارسی",
    en: "English",
  },
  nav: {
    dashboard: "Dashboard",
    catalog: "Catalog",
    admin: "Admin",
  },
  role: {
    owner: "Workspace owner",
    member: "Workspace member",
    signOut: "Sign out",
  },
  status: {
    open: { label: "Open", hint: "Logged, nobody has picked it up yet" },
    pending: {
      label: "Waiting",
      hint: "Replied to, waiting on the requester",
    },
    resolved: { label: "Resolved", hint: "Handled and confirmed" },
    closed: { label: "Closed", hint: "Archived, kept for the record" },
  },
  priority: {
    low: { label: "Low", hint: "Whenever there is room" },
    normal: { label: "Normal", hint: "Standard queue order" },
    high: { label: "High", hint: "Blocking someone today" },
    urgent: { label: "Urgent", hint: "Stop everything else" },
  },
  filters: {
    all: "All",
    allPriorities: "All priorities",
    anyOwner: "Any owner",
    mine: "Assigned to me",
    unassigned: "Unassigned",
    clear: "Clear filters",
  },
  catalog: {
    title: "Catalog",
    description: "Every ticket the team has logged, searchable in one place.",
    search: "Search title, reference, or owner",
    columnTicket: "Ticket",
    columnOwner: "Owner",
    columnPriority: "Priority",
    columnStatus: "Status",
    columnUpdated: "Updated",
    loggedBy: "logged by {name}",
    emptyFiltered: "No tickets match these filters",
    emptyNone: "Nothing in the catalog yet",
    emptyFilteredHint: "Try a different status, priority, owner, or search term.",
    emptyNoneHint:
      "Log the first ticket, or load a sample queue to see how triage works.",
    loadSample: "Load sample tickets",
    onRecord: "{count} tickets on record",
    matching: "{count} tickets matching filters",
  },
  ticket: {
    missing: "This ticket no longer exists, or the link is out of date.",
    request: "Request",
    openedAt: "opened {date}",
    attachments: "Attachments",
    download: "Download",
    discussion: "Discussion",
    noComments: "No comments yet — start the thread",
    commentCount: "{count} comments",
    addComment: "Add a comment",
    commentPlaceholder: "Share findings, blockers, or the next step.",
    postComment: "Post comment",
    commentHint:
      "A comment from the requester reopens the ticket; anyone else moves it to waiting. ⌘/Ctrl + Enter to post.",
    triage: "Triage",
    triageHint: "Status and priority decide what the queue shows first",
    ownerOwned: "This teammate owns the next move.",
    ownerNone: "Nobody owns this ticket yet.",
    markResolved: "Mark as resolved",
    reopen: "Reopen as open",
    addTodo: "Add to my todos",
    details: "Details",
    detailsHint: "Who logged it, and what happened since",
    noEmail: "No email on file",
    opened: "Opened",
    lastActivity: "Last activity",
    firstResponse: "First response",
    firstResponsePending: "pending",
    comments: "Comments",
    files: "Files",
    backToCatalog: "Catalog",
    you: "You",
    followUpTodo: "Follow up: {subject}",
  },
  newTicket: {
    title: "New ticket",
    description: "Log a request with everything someone needs to act on it.",
    cardTitle: "Ticket details",
    cardHint: "One ticket per problem keeps the catalog searchable.",
    titleLabel: "Title",
    titlePlaceholder: "Short, specific summary of the request",
    detailsLabel: "Details",
    detailsPlaceholder:
      "What you expected, what happened instead, and anything you already tried.",
    detailsHint: "Context now saves a round trip later.",
    chars: "{count} chars",
    ownerLabel: "Owner",
    ownerHint:
      "Optional. Leave it unassigned and anyone can pick it up from the catalog.",
    attachmentsLabel: "Attachments",
    chooseFiles: "Choose files",
    filesHint: "Screenshots, logs, or documents — up to 5 files, 10 MB each",
    removeFile: "Remove {name}",
    defaults:
      "New tickets land in the catalog as open with normal priority.",
    create: "Create ticket",
    uploadingOne: "Uploading {name}...",
    uploadingMany: "Uploading file {current} of {total}...",
    creating: "Creating ticket...",
    goodTitle: "What makes a good ticket",
    goodOne: "A title someone can scan in a list of fifty.",
    goodTwo: "Reproduction steps, links, or the exact error you saw.",
    goodThree: "The deadline, if there is one, so priority is obvious.",
    afterTitle: "After you submit",
    afterBody:
      "You land on the ticket's own page. Anyone on the team can comment there and attach context, and the ticket also appears on your dashboard so you can track it without searching.",
    tooLarge: "Each file must be 10 MB or smaller.",
    tooMany: "You can attach up to {max} files.",
    needTitle: "Give the ticket a title of at least 4 characters.",
    needDetails: "Describe the request in at least 10 characters.",
  },
  dashboard: {
    title: "Dashboard",
    description: "Your tickets, your todos, and what is waiting on you.",
    assignedToMe: "Assigned to me",
    assignedToMeHint: "Unresolved tickets with your name on them",
    myOpen: "My open",
    myOpenHint: "Tickets you logged that need work",
    waiting: "Waiting",
    waitingHint: "Answered, waiting on someone else",
    openTodos: "Open todos",
    openTodosHint: "On your personal list",
    assignedCard: "Assigned to you",
    assignedCount: "{count} unresolved tickets in your name",
    assignedNone: "Nothing is waiting on you right now",
    inboxZero: "Inbox zero",
    inboxZeroHint:
      "Tickets appear here once you claim one. Pick up anything unowned from the catalog.",
    findWork: "Find something to pick up",
    myTickets: "My tickets",
    myTicketsTotal: "{total} you logged · {done} closed out",
    myTicketsNone: "Nothing logged under your name yet",
    noTickets: "No tickets yet",
    noTicketsHint:
      "Log something you are waiting on and it shows up here alongside the rest of the catalog.",
    todos: "Todos",
    todoSummary: "{open} open · {done} done",
    todoAdd: "Add a todo",
    todoEmpty:
      "Empty list. Todos are private to you — use them for follow-ups that do not deserve their own ticket.",
    todoAdded: "added {time}",
    todoLinked: " · linked to ticket",
    markDone: "Mark as done",
    markNotDone: "Mark as not done",
    deleteTodo: "Delete todo",
    teamCard: "Across the team",
    teamHint: "The whole queue, not just your slice of it",
    teamOpen: "Open",
    teamOpenHint: "Nobody has replied yet",
    teamWaiting: "Waiting",
    teamWaitingHint: "Waiting on someone",
    teamUrgent: "Urgent",
    teamUrgentHint: "High or urgent, open",
    teamUnassigned: "Unassigned",
    teamUnassignedHint: "Nobody owns these yet",
  },
  admin: {
    title: "Admin",
    description: "Team-wide numbers and every ticket, editable in place.",
    open: "Open",
    openHint: "Nobody has replied yet",
    waitingHint: "Replied, waiting on the requester",
    attention: "Needs attention",
    attentionHint: "High or urgent, still unresolved",
    resolvedWeek: "Resolved this week",
    resolvedWeekHint: "Closed out in the last 7 days",
    emptyTitle: "The workspace is empty",
    emptyBody:
      "Load ten realistic tickets to see the stats, the queue, and the comment threads working. Sample data is only added when the catalog has no tickets.",
    loadSample: "Load sample tickets",
    volume: "Ticket volume",
    volumeHint: "Tickets logged per day over the last two weeks",
    queue: "Queue",
    queueHint: "Unresolved tickets, most recent activity first",
    queueClear: "Queue is clear",
    queueClearHint: "Every ticket is resolved or closed.",
    health: "Response health",
    healthHint: "Derived from every ticket on record",
    medianResponse: "Median first response",
    oldestWaiting: "Oldest unreplied ticket",
    none: "None",
    onRecord: "Tickets on record",
    unassignedStat: "Unassigned",
    allTickets: "All tickets",
    allTicketsHint:
      "Change status or priority inline, or delete what does not belong here",
    noneToManage: "No tickets to manage yet.",
    deleteAria: "Delete {reference}",
    deleteTitle: "Delete {reference}?",
    deleteBody:
      "“{subject}” and its comments and attachments will be removed for everyone. This cannot be undone.",
    keepIt: "Keep it",
    delete: "Delete ticket",
    queueNone: "Nothing unresolved right now",
    chartLogged: "Logged",
    chartTickets: "{count} tickets",
  },
  landing: {
    signIn: "Sign in",
    overline: "Internal ticketing system",
    navCapabilities: "Capabilities",
    navWorkflow: "Workflow",
    navDesk: "The desk",
    heroTitle: "Every request the team owes",
    heroAccent: ", in one quiet queue",
    heroBody:
      "Intake is a private ticketing desk for a handful of people. Log what you are waiting on, comment in context, attach the file that explains it, and keep a todo list that stays yours.",
    ctaPrimary: "Sign in or create an account",
    ctaSecondary: "See what it does",
    factCode: "one-time code sign-in",
    factSearch: "full-text search",
    factFiles: "attachments up to 10 MB",
    previewTitle: "catalog",
    previewCount: "10 tickets",
    previewOpen: "Open",
    previewWaiting: "Waiting",
    previewResolved: "Resolved",
    previewUrgent: "Urgent",
    previewRowOne: "Rotate the staging API keys before Friday",
    previewRowTwo: "Deploy runbook is out of date",
    previewRowThree: "Import fails on files larger than 5 MB",
    previewCommentName: "Maya Okafor",
    previewCommentInitials: "MO",
    previewCommentTime: "2h ago",
    previewCommentBody:
      "Confirmed on my machine too. The uploader rejects anything over 5 MB, so I raised the limit to 20 MB on my branch.",
    previewFile: "deploy-log.txt",
    previewSize: "128 KB",
    previewQuery: "select * from tickets order by last_activity_at desc;",
    capabilitiesOverline: "Capabilities",
    capabilitiesTitle: "Everything a small team actually needs",
    capabilitiesBody:
      "Accounts, a searchable catalog, detail pages, file uploads, comments, personal todos, and an admin area. Nothing else competing for attention.",
    capabilityOneTitle: "Sign up in a minute",
    capabilityOneBody:
      "Sign in with a work email and a one-time code. No passwords to create, store, or rotate.",
    capabilityTwoTitle: "Browse the catalog",
    capabilityTwoBody:
      "Every ticket the team has logged, grouped by status and ordered by the last thing that happened.",
    capabilityThreeTitle: "Search that finds it",
    capabilityThreeBody:
      "Match on title, reference, requester, or the latest comment, then narrow by status and priority.",
    capabilityFourTitle: "Post and upload",
    capabilityFourBody:
      "Open a ticket with screenshots, logs, or documents attached — up to five files, 10 MB each.",
    capabilityFiveTitle: "Comment in context",
    capabilityFiveBody:
      "The thread lives on the ticket, so nobody has to reconstruct the story from an inbox later.",
    capabilitySixTitle: "Your own dashboard",
    capabilitySixBody:
      "The tickets you logged, what is waiting on you, and a private todo list beside them.",
    workflowOverline: "Workflow",
    workflowTitle: "From request to record in three moves",
    workflowOneTitle: "Log the request",
    workflowOneBody:
      "Write the title, the details, and attach what matters. It lands in the catalog as open with normal priority.",
    workflowTwoTitle: "Triage it",
    workflowTwoBody:
      "Set status and priority from the ticket page or inline in the admin table. The queue reorders itself.",
    workflowThreeTitle: "Close the loop",
    workflowThreeBody:
      "Comment as you work, mark it resolved, and the thread keeps a searchable record of what happened.",
    deskOverline: "For whoever is on duty",
    manageTitle: "Run the desk from the admin area",
    manageBody:
      "Team-wide numbers first: volume by day, what is unresolved, how long a first response usually takes, and which tickets have been sitting the longest.",
    manageOne: "Inline status and priority on every row, no page hopping.",
    manageTwo:
      "Delete tickets you logged by mistake, with their files and comments cleaned up.",
    manageThree:
      "Every screen sits behind an account, so the catalog is not public.",
    ownTitle: "Track your own work too",
    ownBody:
      "Your dashboard is the small slice that belongs to you: the tickets you opened, what is waiting on someone else, and the todos that never needed a ticket of their own.",
    ownOne: "Counts update as the queue moves, because they read the same data.",
    ownTwo: "Todos are private to you and can be linked to a ticket.",
    ownThree:
      "Commenting as the requester reopens a ticket; anyone else moves it to waiting.",
    ctaOverline: "Private by default",
    ctaTitle: "Give the team a desk, keep the catalog private",
    ctaBody:
      "Sign in with a work email and Intake creates your account on the spot. Tickets, comments, and todos are visible to signed-in teammates only.",
    ctaFinalPrimary: "Sign in or create an account",
    ctaFinalSecondary: "Go to the admin area",
  },
  auth: {
    title: "Sign in to Intake",
    description:
      "Use your work email and we'll send a one-time code. Your first sign-in creates the account.",
    emailPlaceholder: "name@example.com",
    guest: "Explore as a guest",
    checkEmail: "Check your email",
    codeSent: "We've sent a code to {email}",
    verify: "Verify code",
    verifying: "Verifying...",
    differentEmail: "Use different email",
    noCode: "Didn't receive a code?",
    tryAgain: "Try again",
    invalidCode: "The verification code you entered is incorrect.",
    sendFailed: "Failed to send verification code. Please try again.",
    guestFailed: "Failed to sign in as guest: {message}",
    securedBy: "Secured by",
  },
  notFound: {
    overline: "Error 404",
    title: "Nothing lives at this address",
    body: "The link may be old, or the ticket it pointed at has been deleted.",
    dashboard: "Back to dashboard",
    catalog: "Browse the catalog",
  },
  toasts: {
    ticketCreated: "Ticket {reference} created",
    commentPosted: "Comment posted",
    todoAdded: "Added to your todos",
    todoOpen: "Open dashboard",
    statusSet: "Status set to {status}",
    prioritySet: "Priority set to {priority}",
    ownerUpdated: "Owner updated",
    ownerCleared: "Owner cleared",
    sampleLoaded: "Loaded {count} sample tickets",
    sampleExists: "The catalog already has tickets",
    deleted: "Deleted {reference}",
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    uploadFailed: "Could not upload {name}.",
    createTicket: "Could not create that ticket.",
    postComment: "Could not post that comment.",
    updateStatus: "Could not update the status.",
    updatePriority: "Could not update the priority.",
    updateOwner: "Could not change the owner.",
    addTodo: "Could not add that todo.",
    updateTodo: "Could not update that todo.",
    deleteTodo: "Could not delete that todo.",
    loadSample: "Could not load sample tickets.",
    deleteTicket: "Could not delete that ticket.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { fa, en };

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends object
      ? `${K}.${Leaves<T[K]>}`
      : never;
}[keyof T & string];

export type MessageKey = Leaves<Dictionary>;

function lookup(locale: Locale, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      dictionaries[locale],
    );

  return typeof value === "string" ? value : undefined;
}

/** Translate a dotted key, filling `{placeholders}` from `params`. */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
) {
  const template = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] === undefined ? match : String(params[name]),
  );
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function isLocale(value: unknown): value is Locale {
  return value === "fa" || value === "en";
}

export function dirFor(locale: Locale): Direction {
  return locale === "fa" ? "rtl" : "ltr";
}

// Persian uses the Jalali calendar with Latin digits, which keeps references,
// chart values, and tabular numbers consistent across the interface.
const dateTimeFormatters: Record<Locale, Intl.DateTimeFormat> = {
  fa: new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
    dateStyle: "long",
    timeStyle: "short",
  }),
  en: new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
};

const dayFormatters: Record<Locale, Intl.DateTimeFormat> = {
  fa: new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
    month: "short",
    day: "numeric",
  }),
  en: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }),
};

export function formatDateTime(timestamp: number, locale: Locale) {
  return dateTimeFormatters[locale].format(timestamp);
}

export function formatDayLabel(day: string, locale: Locale) {
  const [year, month, date] = day.split("-").map(Number);
  return dayFormatters[locale].format(new Date(year, month - 1, date));
}

export function timeAgo(timestamp: number, locale: Locale) {
  const minutes = Math.round((Date.now() - timestamp) / 60000);

  if (locale === "fa") {
    if (minutes < 1) return "همین حالا";
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} ساعت پیش`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days} روز پیش`;
    return dayFormatters.fa.format(timestamp);
  }

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return dayFormatters.en.format(timestamp);
}

export function formatMinutes(minutes: number | null, locale: Locale) {
  if (minutes === null) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (locale === "fa") {
    if (minutes < 60) return `${minutes} دقیقه`;
    if (hours < 24) {
      return rest === 0 ? `${hours} ساعت` : `${hours} ساعت و ${rest} دقیقه`;
    }
    return `${Math.round(hours / 24)} روز`;
  }

  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
  return `${Math.round(hours / 24)}d`;
}

/* -------------------------------------------------------------------------- */
/* Context                                                                    */
/* -------------------------------------------------------------------------- */

export type I18nContextValue = {
  locale: Locale;
  dir: Direction;
  dict: Dictionary;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
