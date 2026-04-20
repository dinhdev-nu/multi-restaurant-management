import React from "react"

type Testimonial = {
  text: string
  name: string
  role: string
  avatarSrc: string
  companyAlt: string
  companySrc: string
  companyWidth: number
  avatarStyle?: React.CSSProperties
}

type CompanyLogo = {
  alt: string
  src: string
}

type CommunicationFeature = {
  imageSrc: string
  title: string
  description: string
  bullets: string[]
}

type IconFeature = {
  iconAlt: string
  iconSrc: string
  title: string
  description: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    text: "“Our team's productivity soared with this messaging tool.\nIts simplicity fosters quick decision-making and seamless\ncollaboration, essential for our fast-paced product\ndevelopment.”",
    name: "Emily Rodriguez",
    role: "Emily Rodriguez, PinPoint",
    avatarSrc: "/assets/home/iVBORw0KGg_3.png",
    companyAlt: "PinPoint",
    companySrc: "/assets/home/PHN2ZyB3aW_10.svg",
    companyWidth: 48,
  },
  {
    text: "“With this tool, our team's workflow has become more\nefficient and organized. We spend less time navigating\ncomplex interfaces and more time focusing on what matters:\ndelivering quality products to our customers.”",
    name: "David Patel",
    role: "David Patel, Hues",
    avatarSrc: `/assets/home/iVBORw0KGg_2.png`,
    companyAlt: "Hues",
    companySrc: `/assets/home/PHN2ZyB3aW_5.svg`,
    companyWidth: 48,
  },
  {
    text: "“We've seen remarkable results since integrating AI\nsolutions from this company into our workflows.Their\ncomputer vision technology has enabled us to automate\ntasks and extract valuable insights from visual data.”",
    name: "Rachel Kim",
    role: "Rachel Kim, Greenish",
    avatarSrc: `/assets/home/iVBORw0KGg.png`,
    companyAlt: "Greenish",
    companySrc: `/assets/home/PHN2ZyB3aW_6.svg`,
    companyWidth: 48,
  },
]

const HERO_AVATAR_SRCS = [
  "/assets/home/iVBORw0KGg_3.png",
  "/assets/home/iVBORw0KGg_4.png",
  "/assets/home/iVBORw0KGg_5.png",
]

const COMPANY_LOGOS: CompanyLogo[] = [
  { alt: "ProLine", src: "/assets/home/PHN2ZyB3aW_7.svg" },
  { alt: "Hues", src: "/assets/home/PHN2ZyB3aW_5.svg" },
  { alt: "Greenish", src: "/assets/home/PHN2ZyB3aW_6.svg" },
  { alt: "Cloud", src: "/assets/home/PHN2ZyB3aW_8.svg" },
  { alt: "Volume", src: "/assets/home/PHN2ZyB3aW_9.svg" },
  { alt: "PinPoint", src: "/assets/home/PHN2ZyB3aW_10.svg" },
]

const COMMUNICATION_FEATURES: CommunicationFeature[] = [
  {
    imageSrc: "/assets/home/9j_4AAQSk.jpg",
    title: "Real-Time Messaging",
    description:
      "Our platform offers instantaneous messaging to keep your team connected and responsive. This ensures that all team members are aligned and can react quickly to any updates or changes.",
    bullets: [
      "Instant message delivery",
      "User status indicators (online, offline, busy)",
      "Group and private chat options",
    ],
  },
  {
    imageSrc: "/assets/home/9j_4AAQSk_2.jpg",
    title: "Integrated Task Management",
    description:
      "Enhance communication by integrating discussions directly with tasks. This feature allows team members to collaborate more effectively by linking conversations to specific projects or tasks.",
    bullets: [],
  },
  {
    imageSrc: "/assets/home/9j_4AAQSk_3.jpg",
    title: "Secure Communication Channels",
    description:
      "Prioritize security in team communications with end-to-end encryption. This feature helps in protecting sensitive information while allowing team members to collaborate in a secure environment.",
    bullets: [
      "End-to-end encryption",
      "Secure file sharing and storage",
      "Compliance with global security standards",
    ],
  },
]

const MANAGEMENT_FEATURES: IconFeature[] = [
  {
    iconAlt: "Sprint Planning",
    iconSrc: "/assets/home/PHN2ZyB3aW_11.svg",
    title: "Sprint Planning",
    description:
      "Plan and execute project tasks efficiently within iterative sprint cycles.",
  },
  {
    iconAlt: "Kanban Boards",
    iconSrc: "/assets/home/PHN2ZyB3aW_12.svg",
    title: "Kanban Boards",
    description:
      "Visualize project workflow and track task progress with customizable Kanban boards.",
  },
  {
    iconAlt: "Task Prioritization",
    iconSrc: "/assets/home/PHN2ZyB3aW_13.svg",
    title: "Task Prioritization",
    description:
      "Prioritize tasks based on urgency and importance to ensure efficient use of resources.",
  },
  {
    iconAlt: "Collaborative Task Boards",
    iconSrc: "/assets/home/PHN2ZyB3aW_14.svg",
    title: "Collaborative Task Boards",
    description:
      "Collaboratively manage tasks and assignments in real-time, fostering teamwork and accountability.",
  },
  {
    iconAlt: "Backlog Management",
    iconSrc: "/assets/home/PHN2ZyB3aW_15.svg",
    title: "Backlog Management",
    description:
      "Maintain a backlog of tasks and user stories, ensuring a steady flow of work for your team.",
  },
  {
    iconAlt: "Burndown Charts",
    iconSrc: "/assets/home/PHN2ZyB3aW_16.svg",
    title: "Burndown Charts",
    description:
      "Monitor project progress and identify potential bottlenecks with easy-to-read burndown charts.",
  },
]

const COLLABORATION_FEATURES: IconFeature[] = [
  {
    iconAlt: "Real-time Messaging",
    iconSrc: "/assets/home/PHN2ZyB3aW_11.svg",
    title: "Real-time Messaging",
    description:
      "Instantly communicate and collaborate with team members, keeping everyone aligned and informed.",
  },
  {
    iconAlt: "File Sharing",
    iconSrc: "/assets/home/PHN2ZyB3aW_12.svg",
    title: "File Sharing",
    description:
      "Share documents, images, and files effortlessly within your team, ensuring easy access to important resources.",
  },
  {
    iconAlt: "Task Management",
    iconSrc: "/assets/home/PHN2ZyB3aW_13.svg",
    title: "Task Management",
    description:
      "Organize tasks, assign responsibilities, and track progress in one centralized platform, promoting accountability and efficiency.",
  },
]

const PRODUCTIVITY_FEATURES: IconFeature[] = [
  {
    iconAlt: "Real-time Messaging",
    iconSrc: "/assets/home/PHN2ZyB3aW_17.svg",
    title: "Real-time Messaging",
    description:
      "Instantly communicate with your team, ensuring swift decision-making and seamless collaboration on project tasks and updates.",
  },
  {
    iconAlt: "Task Management",
    iconSrc: "/assets/home/PHN2ZyB3aW_18.svg",
    title: "Task Management",
    description:
      "Organize and prioritize tasks effectively, assigning responsibilities and tracking progress to keep projects on schedule and within scope.",
  },
  {
    iconAlt: "File Sharing",
    iconSrc: "/assets/home/PHN2ZyB3aW_19.svg",
    title: "File Sharing",
    description:
      "Share documents, images, and other files effortlessly within your team, enabling easy access to project resources and materials.",
  },
  {
    iconAlt: "Real-time Insights",
    iconSrc: "/assets/home/PHN2ZyB3aW_20.svg",
    title: "Real-time Insights",
    description:
      "Gain actionable insights instantly with real-time data analysis and visualization.",
  },
  {
    iconAlt: "Smart Notifications",
    iconSrc: "/assets/home/PHN2ZyB3aW_21.svg",
    title: "Smart Notifications",
    description:
      "Stay informed about project updates and important discussions without being overwhelmed, thanks to customizable notification settings.",
  },
  {
    iconAlt: "Team Analytics",
    iconSrc: "/assets/home/PHN2ZyB3aW_22.svg",
    title: "Team Analytics",
    description:
      "Gain insights into team performance and communication trends with built-in analytics, empowering you to optimize workflows and enhance productivity.",
  },
]

function CheckIcon() {
  return (
    <svg
      className="text-[--text-tertiary] dark:text-[--dark-text-tertiary]"
      fill="none"
      height={15}
      viewBox="0 0 15 15"
      width={15}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
        fill="currentColor"
        fillRule="evenodd"
      ></path>
    </svg>
  )
}

function CheckListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4 font-normal text-[--text-secondary] dark:text-[--dark-text-secondary]">
      <span className="flex size-6 items-center justify-center rounded-full bg-[--surface-tertiary] dark:bg-[--dark-surface-tertiary]">
        <CheckIcon />
      </span>
      {children}
    </li>
  )
}

function CommunicationFeatureCard({
  feature,
}: {
  feature: CommunicationFeature
}) {
  return (
    <article className="flex min-h-96 w-full max-w-[380px] flex-col rounded-lg border border-[--border] bg-[--surface-secondary] p-px sm:max-w-full md:w-full md:flex-row md:odd:flex-row-reverse xl:gap-16 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary]">
      <figure className="p-2 md:h-auto md:w-[360px] lg:w-[480px] xl:w-[560px]">
        <img
          alt=""
          className="sf-hidden block hidden aspect-video h-[200px] w-full rounded-lg border border-[--border] object-cover md:h-full dark:block dark:border-[--dark-border]"
          data-nimg={1}
          decoding="async"
          height={374}
          loading="lazy"
          src="data:,"
          style={{ color: "transparent" }}
          width={560}
        />
        <img
          alt=""
          className="block aspect-video h-[200px] w-full rounded-lg border border-[--border] object-cover md:h-full dark:hidden dark:border-[--dark-border]"
          data-nimg={1}
          decoding="async"
          height={374}
          loading="lazy"
          src={feature.imageSrc}
          style={{ color: "transparent" }}
          width={560}
        />
      </figure>
      <div className="flex flex-col gap-8 p-5 pt-6 md:flex-1 md:p-10">
        <div className="flex flex-col items-start gap-2">
          <h5 className="text-2xl font-medium text-[--text-primary] md:text-3xl dark:text-[--dark-text-primary]">
            {feature.title}
          </h5>
          <p className="font-normal text-[--text-secondary] md:text-lg dark:text-[--dark-text-secondary]">
            {feature.description}
          </p>
        </div>
        <ul className="flex flex-col items-start gap-3 pl-2 md:text-lg">
          {feature.bullets.map((bullet) => (
            <CheckListItem key={bullet}>{bullet}</CheckListItem>
          ))}
        </ul>
      </div>
    </article>
  )
}

function ManagementFeatureCard({ feature }: { feature: IconFeature }) {
  return (
    <article className="flex flex-col gap-4 rounded-lg border border-[--border] p-4 [box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset] dark:border-[--dark-border] dark:[box-shadow:_70px_-20px_130px_0px_rgba(255,255,255,0.05)_inset]">
      <figure className="flex size-9 items-center justify-center rounded-full border border-[--border] bg-[--surface-secondary] p-2 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary]">
        <img
          alt={feature.iconAlt}
          className="dark:invert"
          data-nimg={1}
          decoding="async"
          height={18}
          loading="lazy"
          src={feature.iconSrc}
          style={{ color: "transparent" }}
          width={18}
        />
      </figure>
      <div className="flex flex-col items-start gap-1">
        <h5 className="text-lg font-medium">{feature.title}</h5>
        <p className="text-pretty text-[--text-secondary] dark:text-[--dark-text-secondary]">
          {feature.description}
        </p>
      </div>
    </article>
  )
}

function CollaborationFeatureCard({ feature }: { feature: IconFeature }) {
  return (
    <article className="flex flex-col gap-4">
      <figure className="flex size-9 items-center justify-center rounded-full border border-[--border] bg-[--surface-secondary] p-2 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary]">
        <img
          alt={feature.iconAlt}
          className="dark:invert"
          data-nimg={1}
          decoding="async"
          height={18}
          loading="lazy"
          src={feature.iconSrc}
          style={{ color: "transparent" }}
          width={18}
        />
      </figure>
      <div className="flex flex-col items-start gap-1">
        <h5 className="text-lg font-medium">{feature.title}</h5>
        <p className="text-[--text-tertiary] dark:text-[--dark-text-tertiary]">
          {feature.description}
        </p>
      </div>
    </article>
  )
}

function ProductivityFeatureCard({ feature }: { feature: IconFeature }) {
  return (
    <article className="flex w-[280px] shrink-0 flex-col gap-4 rounded-lg border border-[--border] bg-[--surface-secondary] p-4 lg:w-full lg:flex-row lg:p-5 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary]">
      <figure className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[--surface-tertiary] p-3 dark:bg-[--dark-surface-tertiary]">
        <img
          alt={feature.iconAlt}
          className="dark:invert"
          data-nimg={1}
          decoding="async"
          height={24}
          loading="lazy"
          src={feature.iconSrc}
          style={{ color: "transparent" }}
          width={24}
        />
      </figure>
      <div className="flex flex-col items-start gap-1">
        <h5 className="text-lg font-medium">{feature.title}</h5>
        <p className="text-pretty text-[--text-tertiary] dark:text-[--dark-text-tertiary]">
          {feature.description}
        </p>
      </div>
    </article>
  )
}

export default function LandingMain() {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -350, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: "smooth" })
    }
  }

  return (
    <>
      <section className="relative min-h-[calc(630px-var(--header-height))] overflow-hidden pb-10">
        <div className="absolute top-0 left-0 z-0 grid h-full w-full grid-cols-[clamp(28px,10vw,120px)_auto_clamp(28px,10vw,120px)] border-b border-[--border] dark:border-[--dark-border]">
          <div className="col-span-1 flex h-full items-center justify-center"></div>
          <div className="col-span-1 flex h-full items-center justify-center border-x border-[--border] dark:border-[--dark-border]"></div>
          <div className="col-span-1 flex h-full items-center justify-center"></div>
        </div>
        <figure className="pointer-events-none absolute -bottom-[70%] left-1/2 z-0 block aspect-square w-[520px] -translate-x-1/2 rounded-full bg-[--accent-500-40] blur-[200px]"></figure>
        <figure className="pointer-events-none absolute top-[64px] left-[4vw] z-20 hidden aspect-square w-[32vw] rounded-full bg-[--surface-primary] opacity-50 blur-[100px] md:block dark:bg-[--dark-surface-primary]"></figure>
        <figure className="pointer-events-none absolute right-[7vw] bottom-[-50px] z-20 hidden aspect-square w-[30vw] rounded-full bg-[--surface-primary] opacity-50 blur-[100px] md:block dark:bg-[--dark-surface-primary]"></figure>
        <div className="relative z-10 flex flex-col divide-y divide-[--border] pt-[35px] dark:divide-[--dark-border]">
          <div className="flex flex-col items-center justify-end">
            <div className="flex items-center gap-2 !border !border-b-0 border-[--border] px-4 py-2 dark:border-[--dark-border]">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {HERO_AVATAR_SRCS.map((src) => (
                  <img
                    key={src}
                    alt="Avatar"
                    className="size-7 shrink-0 rounded-full border-2 border-[--surface-primary] object-cover dark:border-[--dark-surface-primary]"
                    data-nimg={1}
                    decoding="async"
                    height={28}
                    src={src}
                    style={{ color: "transparent" }}
                    width={28}
                  />
                ))}
              </div>
              <p className="text-sm tracking-tight text-[--text-tertiary] dark:text-[--dark-text-tertiary]">
                1,254 happy customers
              </p>
            </div>
          </div>
          <div>
            <div className="mx-auto flex min-h-[288px] max-w-[80vw] shrink-0 flex-col items-center justify-center gap-2 px-2 py-4 sm:px-16 lg:px-24">
              <h1 className="!max-w-screen-lg text-center text-[clamp(32px,7vw,64px)] leading-none font-medium tracking-[-1.44px] text-pretty text-[--text-primary] md:tracking-[-2.16px] dark:text-[--dark-text-primary]">
                Streamlined Communication for Iterating Fast
              </h1>
              <h2 className="text-md max-w-2xl text-center text-pretty text-[--text-tertiary] md:text-lg dark:text-[--dark-text-tertiary]">
                Acme is an installable, self-hosted team chat system. You can
                have several paragraphs in here and the thing will wrap
                gracefully.
              </h2>
            </div>
          </div>
          <div className="flex items-start justify-center px-8 sm:px-24">
            <div className="flex w-full max-w-[80vw] flex-col items-center justify-start md:!max-w-[392px]">
              <a
                className="max-w-sm:!border-x-0 flex inline-flex !h-14 h-8 w-full shrink-0 flex-col items-center justify-center gap-1 rounded-full rounded-none border !border-x !border-y-0 border-[--border] !bg-transparent bg-[--surface-secondary] px-3.5 !text-base text-sm font-normal text-[--text-primary] ring-[--control] outline-hidden outline-0 backdrop-blur-xl transition-colors duration-150 hover:!bg-black/5 hover:bg-[--surface-tertiary] focus-visible:ring-2 md:px-5 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:hover:!bg-white/5 dark:hover:bg-[--dark-surface-tertiary]"
                href="/#request-demo"
              >
                Request Demo
              </a>
              <a
                className="flex inline-flex !h-14 h-8 w-full shrink-0 flex-col items-center justify-center gap-1 rounded-full rounded-none border-[--accent-600] bg-[--accent-500] px-3.5 !text-base text-sm font-normal text-[--text-on-accent-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--accent-600] focus-visible:ring-2 md:px-5"
                href="/auth/register"
              >
                Get Started for Free
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="relative flex flex-col items-center gap-10 py-14 md:py-[72px]">
        <h2 className="text-center tracking-tight text-[--dark-text-tertiary] opacity-50">
          Join 4,000+ companies already growing
        </h2>
        <div className="no-scrollbar flex max-w-full justify-center overflow-auto">
          <div className="from-surface-primary dark:from-dark-surface-primary sf-hidden pointer-events-none absolute top-0 left-0 h-full w-[30vw] bg-transparent bg-linear-to-r xl:hidden"></div>
          <div className="from-surface-primary dark:from-dark-surface-primary sf-hidden pointer-events-none absolute top-0 right-0 h-full w-[30vw] bg-transparent bg-linear-to-l xl:hidden"></div>
          <div className="companies-module__fhyRlW__scrollbar flex shrink-0 items-center gap-4 px-6 lg:gap-6 lg:px-12">
            {COMPANY_LOGOS.map((logo) => (
              <figure
                key={logo.alt}
                className="flex h-16 items-center px-2 py-3 lg:p-4"
              >
                <img
                  alt={logo.alt}
                  className="w-24 lg:w-32"
                  data-nimg={1}
                  decoding="async"
                  height={20}
                  loading="lazy"
                  src={logo.src}
                  style={{ color: "transparent" }}
                  width={32}
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section className="relative container mx-auto flex flex-col items-center gap-10 px-6 py-14 md:py-[72px]">
        <div className="flex flex-col items-center gap-3 self-center">
          <h3 className="flex min-h-7 items-center justify-center gap-2 rounded-full bg-[--surface-secondary] px-3.5 pb-px text-sm font-medium text-[--text-tertiary] md:text-base dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-tertiary]">
            Communication
          </h3>
          <div className="flex max-w-[800px] flex-col items-center justify-center gap-1 self-center [&>*]:text-center [&>*]:text-3xl [&>*]:font-medium [&>*]:text-pretty md:[&>*]:text-4xl">
            <h4>Enhanced Team Communication</h4>
          </div>
          <p className="max-w-screen-md text-center text-lg font-light text-pretty text-[--text-tertiary] md:text-xl dark:text-[--dark-text-tertiary]">
            Simplify team discussions and collaboration with our efficient
            messaging features, enabling swift decision-making and project
            progress tracking.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {COMMUNICATION_FEATURES.map((feature) => (
            <CommunicationFeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>
      <section className="relative container mx-auto flex flex-col items-center gap-10 px-6 py-14 md:py-[72px]">
        <div className="flex flex-col items-center gap-3 self-center">
          <h3 className="flex min-h-7 items-center justify-center gap-2 rounded-full bg-[--surface-secondary] px-3.5 pb-px text-sm font-medium text-[--text-tertiary] md:text-base dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-tertiary]">
            Management
          </h3>
          <div className="flex max-w-[800px] flex-col items-center justify-center gap-1 self-center [&>*]:text-center [&>*]:text-3xl [&>*]:font-medium [&>*]:text-pretty md:[&>*]:text-4xl">
            <h4 title="Agile Project Planning">Agile Project Planning</h4>
          </div>
          <p className="max-w-screen-md text-center text-lg font-light text-pretty text-[--text-tertiary] md:text-xl dark:text-[--dark-text-tertiary]">
            Drive project success with agile project management capabilities
            tailored for small teams focused on rapid product development.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          {MANAGEMENT_FEATURES.map((feature) => (
            <ManagementFeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 md:order-3">
          <a
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border-[--accent-600] bg-[--accent-500] px-5 text-sm font-normal text-[--text-on-accent-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--accent-600] focus-visible:ring-2 md:h-10 md:text-base"
            href="/auth/register"
          >
            Get started
          </a>
          <a
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border border-[--border] bg-[--surface-secondary] px-5 text-sm font-normal text-[--text-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--surface-tertiary] focus-visible:ring-2 md:h-10 md:text-base dark:border-[--dark-border] dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:hover:bg-[--dark-surface-tertiary]"
            href="/#features-collaborative-task-boards"
          >
            See more
          </a>
        </div>
      </section>
      <section className="relative container mx-auto flex flex-col items-center gap-10 px-6 py-14 md:py-[72px]">
        <article className="flex flex-col justify-center gap-9 self-stretch rounded-xl bg-[rgba(var(--accent-500),0.1)] p-6 lg:flex-row lg:justify-between lg:p-10 dark:bg-[rgba(var(--accent-600),0.1)]">
          <div className="flex flex-col gap-2">
            <h4 className="text-3xl font-medium text-[--text-primary] lg:text-4xl dark:text-[--dark-text-primary]">
              Enhance your team's productivity with Acme
            </h4>
            <p className="text-lg text-[--text-secondary] lg:text-xl dark:text-[--dark-text-secondary]">
              Write in threads, focus, and collaborate without video calls.
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-2 md:flex lg:flex-col">
            <a
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border-[--accent-600] bg-[--accent-500] px-3.5 text-sm font-normal text-[--text-on-accent-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--accent-600] focus-visible:ring-2 md:px-5"
              href="/auth/register"
            >
              Get started
            </a>
            <a
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-[--border] bg-[--surface-secondary] px-3.5 text-sm font-normal text-[--text-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--surface-tertiary] focus-visible:ring-2 md:px-5 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:hover:bg-[--dark-surface-tertiary]"
              href="#"
            >
              See more
            </a>
          </div>
        </article>
      </section>
      <section className="relative container mx-auto flex flex-col items-center gap-10 px-6 py-14 md:py-[72px]">
        <img
          alt="A group of people with speech bubbles above them"
          className="sf-hidden block hidden rounded-xl border border-[--border] md:order-3 md:w-full dark:block dark:border-[--dark-border]"
          data-nimg={1}
          decoding="async"
          height={600}
          loading="lazy"
          src="data:,"
          style={{ color: "transparent" }}
          width={1216}
        />
        <img
          alt="A group of people with speech bubbles above them"
          className="block rounded-xl border border-[--border] md:order-3 md:w-full dark:hidden dark:border-[--dark-border]"
          data-nimg={1}
          decoding="async"
          height={600}
          loading="lazy"
          src="/assets/home/UklGRsBLAg.webp"
          style={{ color: "transparent" }}
          width={1216}
        />
        <div className="flex flex-col items-center gap-3 self-center">
          <h3 className="flex min-h-7 items-center justify-center gap-2 rounded-full bg-[--surface-secondary] px-3.5 pb-px text-sm font-medium text-[--text-tertiary] md:text-base dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-tertiary]">
            Collaboration
          </h3>
          <div className="flex max-w-[800px] flex-col items-center justify-center gap-1 self-center [&>*]:text-center [&>*]:text-3xl [&>*]:font-medium [&>*]:text-pretty md:[&>*]:text-4xl">
            <h4 title="Seamless Collaboration, Enhanced Productivity">
              Seamless Collaboration, Enhanced Productivity
            </h4>
          </div>
          <p className="max-w-screen-md text-center text-lg font-light text-pretty text-[--text-tertiary] md:text-xl dark:text-[--dark-text-tertiary]">
            Empower your team with integrated tools for file sharing, task
            management, and real-time collaboration, ensuring smooth project
            workflows from start to finish.
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-4 md:order-2 md:grid md:grid-cols-3 md:gap-16">
          {COLLABORATION_FEATURES.map((feature) => (
            <CollaborationFeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>
      <section className="relative flex flex-col items-center gap-10 py-14 md:py-[72px] lg:container lg:mx-auto lg:!flex-row lg:gap-0 lg:p-28">
        <div className="relative top-0 container mx-auto shrink self-stretch px-6 lg:w-1/2 lg:pr-12 lg:pl-0 xl:pr-20">
          <div className="sticky top-[calc(var(--header-height)+40px)] bottom-0 flex flex-col gap-10">
            <div className="flex flex-col items-start gap-3 self-start">
              <h3 className="flex min-h-7 items-center justify-center gap-2 rounded-full bg-[--surface-secondary] px-3.5 pb-px text-sm font-medium text-[--text-tertiary] md:text-base dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-tertiary]">
                Productivity
              </h3>
              <div className="flex max-w-[800px] flex-col items-start justify-center gap-1 self-start [&>*]:text-left [&>*]:text-3xl [&>*]:font-medium [&>*]:text-pretty md:[&>*]:text-4xl">
                <h4 title="Supercharge Team Productivity">
                  Supercharge Team Productivity
                </h4>
              </div>
              <p className="max-w-screen-md text-left text-lg font-light text-pretty text-[--text-tertiary] md:text-xl dark:text-[--dark-text-tertiary]">
                Keep your team focused and productive as they collaborate on
                building and shipping products swiftly.
              </p>
            </div>
            <div className="flex items-center gap-3 md:order-3">
              <a
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border-[--accent-600] bg-[--accent-500] px-5 text-sm font-normal text-[--text-on-accent-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--accent-600] focus-visible:ring-2 md:h-10 md:text-base"
                href="/auth/register"
              >
                Get started
              </a>
              <a
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full border border-[--border] bg-[--surface-secondary] px-5 text-sm font-normal text-[--text-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--surface-tertiary] focus-visible:ring-2 md:h-10 md:text-base dark:border-[--dark-border] dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:hover:bg-[--dark-surface-tertiary]"
                href="/#features-realtime-insights"
              >
                See more
              </a>
            </div>
          </div>
        </div>
        <div className="w-full flex-1 shrink-0 lg:w-1/2 lg:flex-1">
          <div className="no-scrollbar flex gap-10 overflow-auto px-6 lg:flex-col lg:px-0">
            {PRODUCTIVITY_FEATURES.map((feature) => (
              <ProductivityFeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>
      <section className="relative container mx-auto flex flex-col items-center gap-10 px-6 py-14 md:py-[72px]">
        <article className="relative flex flex-col items-center justify-center gap-9 self-stretch overflow-hidden rounded-xl border border-[--border] bg-[--surface-secondary] p-6 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary]">
          <div className="callout-1-module__wLojUq__line absolute top-10 left-0 h-px w-full bg-linear-to-l from-black/40 to-transparent dark:from-white/40 dark:to-transparent"></div>
          <div className="callout-1-module__wLojUq__line absolute bottom-[72px] left-0 h-px w-full bg-linear-to-l from-black/40 to-transparent dark:from-white/40 dark:to-transparent"></div>
          <div className="callout-1-module__wLojUq__line absolute bottom-7 left-0 h-px w-full bg-linear-to-l from-black/40 to-transparent dark:from-white/40 dark:to-transparent"></div>
          <div className="absolute top-0 left-0 z-10 h-full w-full bg-[--surface-secondary] blur-3xl filter dark:bg-[--dark-surface-secondary]"></div>
          <div className="relative z-20 flex flex-col items-center gap-2 text-center">
            <h4 className="text-center text-3xl font-medium tracking-tighter text-[--text-primary] sm:max-w-full sm:px-0 md:text-4xl dark:text-[--dark-text-primary]">
              Enhance your team's productivity with Acme
            </h4>
            <p className="text-lg text-[--text-secondary] md:text-xl dark:text-[--dark-text-secondary]">
              Write in threads, focus, and collaborate without video calls.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <a
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border-[--accent-600] bg-[--accent-500] px-3.5 text-sm font-normal text-[--text-on-accent-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--accent-600] focus-visible:ring-2 md:px-5"
              href="/auth/register"
            >
              Get started
            </a>
            <a
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-[--border] bg-[--surface-secondary] px-3.5 text-sm font-normal text-[--text-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--surface-tertiary] focus-visible:ring-2 md:px-5 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:hover:bg-[--dark-surface-tertiary]"
              href="#"
            >
              See more
            </a>
          </div>
        </article>
      </section>
      <div className="relative overflow-clip">
        <section className="relative container mx-auto flex flex-col items-center gap-10 px-6 py-14 md:py-[72px]">
          <div className="flex w-full flex-col gap-14">
            <div className="flex justify-between">
              <div className="flex flex-col items-start gap-3 self-start self-stretch">
                <div className="flex max-w-[800px] flex-col items-start justify-center gap-1 self-start [&>*]:text-left [&>*]:text-3xl [&>*]:font-medium [&>*]:text-pretty md:[&>*]:text-4xl">
                  <h4 title="What our clients say">What our clients say</h4>
                </div>
              </div>
              <div className="hidden gap-4 sm:flex">
                <button
                  aria-label="Previous testimonial"
                  onClick={scrollLeft}
                  className="inline-flex !h-auto h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-[--border] bg-[--surface-secondary] px-3.5 px-4 py-2 text-sm font-normal text-[--text-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--surface-tertiary] focus-visible:ring-2 md:px-5 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:hover:bg-[--dark-surface-tertiary]"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    height={15}
                    viewBox="0 0 15 15"
                    width={15}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <button
                  aria-label="Next testimonial"
                  onClick={scrollRight}
                  className="inline-flex !h-auto h-8 shrink-0 items-center justify-center gap-1 rounded-full border border-[--border] bg-[--surface-secondary] !px-4 px-3.5 !py-2 text-sm font-normal text-[--text-primary] ring-[--control] outline-hidden outline-0 hover:bg-[--surface-tertiary] focus-visible:ring-2 md:px-5 dark:border-[--dark-border] dark:bg-[--dark-surface-secondary] dark:text-[--dark-text-primary] dark:hover:bg-[--dark-surface-tertiary]"
                >
                  <svg
                    className="size-6"
                    fill="none"
                    height={15}
                    viewBox="0 0 15 15"
                    width={15}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="relative">
              <div
                ref={scrollRef}
                className="relative no-scrollbar flex h-full w-full snap-x snap-mandatory gap-10 overflow-x-auto scroll-smooth md:gap-0"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {TESTIMONIALS.map((testimonial, idx) => (
                  <div
                    key={idx}
                    className="max-w-full min-w-0 shrink-0 grow-0 basis-[min(740px,100%)] snap-center self-stretch md:pr-10"
                  >
                    <article className="embla__slide !last:visible flex h-full w-full min-w-0 transform touch-pan-y touch-pinch-zoom flex-col rounded-xl border border-[--border] select-none [backface-visibility:hidden] dark:border-[--dark-border]">
                      <div className="flex flex-1 items-start border-b border-[--border] px-5 py-[18px] md:px-8 md:py-7 dark:border-[--dark-border]">
                        <blockquote className="text-xl leading-[135%] font-extralight text-pretty whitespace-pre-wrap text-[--text-primary] sm:text-2xl md:text-4xl dark:text-[--dark-text-primary]">
                          {testimonial.text}
                        </blockquote>
                      </div>
                      <div className="flex items-center gap-4 pl-5">
                        <div className="flex flex-1 items-center gap-5 border-r border-[--border] py-4 dark:border-[--dark-border]">
                          {testimonial.avatarStyle ? (
                            <img
                              alt={testimonial.name}
                              className="hidden size-16 rounded-full md:block"
                              data-nimg={1}
                              decoding="async"
                              height={64}
                              loading="lazy"
                              src={testimonial.avatarSrc}
                              style={testimonial.avatarStyle}
                              width={64}
                            />
                          ) : (
                            <img
                              alt={testimonial.name}
                              className="hidden size-16 rounded-full md:block"
                              data-nimg={1}
                              decoding="async"
                              height={64}
                              loading="lazy"
                              src={testimonial.avatarSrc}
                              style={{ color: "transparent" }}
                              width={64}
                            />
                          )}
                          <div className="flex flex-1 flex-col">
                            <h5 className="text-base font-medium md:text-lg">
                              {testimonial.name}
                            </h5>
                            <p className="text-sm text-pretty text-[--text-tertiary] md:text-base dark:text-[--dark-text-tertiary]">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                        <div className="pr-5">
                          <img
                            alt={testimonial.companyAlt}
                            className="w-12 md:w-16"
                            data-nimg={1}
                            decoding="async"
                            height={48}
                            loading="lazy"
                            src={testimonial.companySrc}
                            style={{ color: "transparent" }}
                            width={testimonial.companyWidth}
                          />
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
              <div className="sf-hidden mt-4 flex w-full justify-center gap-2 md:hidden"></div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
