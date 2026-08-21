import React, { useState } from 'react';
import {
  ExternalLink,
  Mail,
  GraduationCap,
  Trophy,
  BookOpen,
  Phone,
  X
} from 'lucide-react';

interface SughoshDixitPortfolioTabProps {
  onOpenCreatePost?: () => void;
}

export const SughoshDixitPortfolioTab: React.FC<SughoshDixitPortfolioTabProps> = () => {
  const [activeIdentityIndex, setActiveIdentityIndex] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const identities = [
    {
      icon: "🧠",
      title: "Data Scientist",
      description: "Transforming data into insights at Oracle Financial Crime & Compliance",
      color: "#007ACC",
      colorRgb: "0, 122, 204",
      experience: "4+",
      level: "Expert",
      progress: 95,
      tags: ["AI/ML", "Python", "SQL", "Analytics"],
      achievements: [
        "Built ML models for fraud detection & anti-money laundering",
        "Led data extraction for Oracle Cloud HCM",
        "Masters in Data Science from BITS Pilani"
      ],
      currentFocus: "Developing advanced AI models for financial crime prevention and anti-money laundering systems",
      philosophy: "Data is the new oil, but insights are the refined fuel that drives innovation"
    },
    {
      icon: "🎵",
      title: "Musician",
      description: "Devotional singer preserving Bharatiya musical traditions",
      color: "#FFD700",
      colorRgb: "255, 215, 0",
      experience: "10+",
      level: "Master",
      progress: 90,
      tags: ["Bhajans", "Patriotic", "Classical", "Spiritual"],
      achievements: [
        "Weekly bhajan performances & cultural sessions",
        "Patriotic song renditions",
        "Preserving cultural heritage through music"
      ],
      currentFocus: "Learning Vedas and expanding repertoire of spiritual and patriotic compositions",
      philosophy: "Music is the universal language that connects souls and preserves our cultural essence"
    },
    {
      icon: "⚽",
      title: "Footballer",
      description: "Passionate striker with offensive mindset and Liverpool FC devotion",
      color: "#228B22",
      colorRgb: "34, 139, 34",
      experience: "15+",
      level: "Advanced",
      progress: 85,
      tags: ["Striker", "Liverpool FC", "Strategy", "Teamwork"],
      achievements: [
        "Offensive footballer with goal-scoring mindset",
        "Liverpool FC devotee and tactical analyst",
        "Team leadership and high-intensity match play"
      ],
      currentFocus: "Improving tactical speed, winger agility, and contributing to match success",
      philosophy: "Football teaches us that individual brilliance means nothing without team unity and collective purpose"
    },
    {
      icon: "🇮🇳",
      title: "Nationalist",
      description: "Proud advocate of Bharatiya civilization and cultural heritage",
      color: "#55198B",
      colorRgb: "85, 25, 139",
      experience: "Life",
      level: "Devoted",
      progress: 90,
      tags: ["Heritage", "Culture", "Civilization", "Pride"],
      achievements: [
        "Advocate for Bharatiya civilizational values",
        "Working to eradicate colonial consciousness",
        "Prabandhak at RSS Centenary ABPS 2025"
      ],
      currentFocus: "Rebuilding the sense of being a Bharateeya and preserving our civilizational wisdom",
      philosophy: "True nationalism is not about being against others, but about being proud of our own magnificent heritage"
    }
  ];

  const softwareSkills = [
    { name: "Data Science & ML", icon: "🧠", color: "#007ACC", progress: 95 },
    { name: "Python & AI", icon: "🐍", color: "#3776AB", progress: 92 },
    { name: "SQL & Analytics", icon: "🗄️", color: "#336791", progress: 90 },
    { name: "React & Frontend", icon: "⚛️", color: "#61DAFB", progress: 85 },
    { name: "Oracle Cloud", icon: "☁️", color: "#F80000", progress: 88 },
    { name: "Music & Bhajans", icon: "🎵", color: "#FFD700", progress: 90 },
    { name: "Football Strategy", icon: "⚽", color: "#228B22", progress: 85 },
    { name: "Indian Heritage", icon: "🕉️", color: "#FF9933", progress: 90 }
  ];

  const education = [
    {
      schoolName: "BITS PILANI",
      degree: "Master of Technology in Data Science and Engineering",
      duration: "September 2021 - September 2023",
      desc: "Hustled through work and studies with a focus on AI-driven projects",
      bullets: ["Collaborated on cutting-edge AI/ML models", "Specialization in Deep Learning & Financial Analytics"]
    },
    {
      schoolName: "Bangalore Institute of Technology",
      degree: "Bachelor of Technology in Information Science and Engineering",
      duration: "September 2016 - April 2020",
      desc: "Top 10% in program, developing deep foundations in engineering",
      bullets: ["Worked on impactful internships and hackathons", "President of Cultural & Tech societies"]
    }
  ];

  const experiences = [
    {
      role: "Data Scientist",
      company: "Oracle Financial Crime and Compliance Management",
      date: "October 2024 – Present",
      desc: "Building Machine Learning models to combat financial crimes and optimize Anti-Money Laundering efforts. 🌐💼",
      bullets: [
        "Analyzing financial data for fraud detection & suspicious patterns",
        "Developing predictive models to detect suspicious transactions",
        "Collaborating with cross-functional teams for risk mitigation"
      ],
      tag: "Current Role",
      color: "#007ACC"
    },
    {
      role: "Senior Technical Cloud Analyst",
      company: "Oracle",
      date: "September 2020 – September 2024",
      desc: "Led Data Extraction and SQL Reports for Oracle Cloud HCM projects",
      bullets: [
        "Developed custom SQL data extractors for enterprise cloud clients",
        "Optimized database query performance across large-scale HCM datasets"
      ],
      tag: "4 Years",
      color: "#F80000"
    },
    {
      role: "Full Stack Developer Intern",
      company: "Siemens",
      date: "February 2020 – May 2020",
      desc: "Worked on a Live Lead Gen Project - 'Project Chanakya'",
      bullets: [
        "Engineered full stack automation dashboards for enterprise lead conversion"
      ],
      tag: "Internship",
      color: "#28A745"
    },
    {
      role: "Web Development Intern",
      company: "Printalytix",
      date: "July 2018 – September 2018",
      desc: "Worked as a design intern, participated as a guide in a national innovation competition organized by Niti-Aayog at Workbench Projects, Bangalore.",
      bullets: [
        "Designed BPMN for industrial 3D manufacturing scenarios",
        "Operated FDM 3D printers and produced functional prototypes"
      ],
      tag: "Internship",
      color: "#FF6B35"
    }
  ];

  const projects = [
    {
      name: "Oracle Financial Crime and Compliance",
      category: "Financial Technology",
      desc: "Comprehensive financial crime detection and compliance monitoring system using advanced analytics and machine learning to identify suspicious activities and ensure regulatory compliance.",
      tech: ["Oracle Analytics", "Python", "Machine Learning", "SQL", "Oracle Cloud"],
      link: "https://oracle.com/"
    },
    {
      name: "ML4AML",
      category: "Anti-Money Laundering",
      desc: "Machine Learning for Anti-Money Laundering - An advanced AI-powered platform that uses deep learning algorithms to detect and prevent money laundering activities in real-time.",
      tech: ["Python", "TensorFlow", "Deep Learning", "Apache Spark", "Kafka"],
      link: "https://github.com/SughoshDixit9"
    },
    {
      name: "Oracle Cloud HCM Analytics",
      category: "Cloud Analytics",
      desc: "Developed advanced analytics dashboard for Oracle Cloud HCM, providing insights into workforce trends and performance metrics.",
      tech: ["Oracle Analytics", "SQL", "Python", "Tableau", "Oracle Cloud"],
      link: "https://oracle.com/"
    },
    {
      name: "Siemens - Project Chanakya",
      category: "Industrial Automation",
      desc: "Led development of a comprehensive lead generation system for industrial automation solutions, improving lead conversion by 40%.",
      tech: ["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
      link: "https://siemens.com/"
    },
    {
      name: "Printalytix",
      category: "3D Printing & Manufacturing",
      desc: "A comprehensive 3D printing platform that revolutionizes manufacturing processes through advanced analytics and automation.",
      tech: ["React", "Node.js", "Python", "MongoDB", "AWS"],
      link: "https://printalytix.com/"
    }
  ];

  const achievements = [
    {
      title: "Top 25 Exciting Idea at PANIIT All India Hackathon",
      subtitle: "The project Alphers was an Early Age Education Monitoring Application",
      link: "https://drive.google.com/file/d/1XjBXLgkwovXpdsEgIiO4LpzSofx96V0q/view"
    },
    {
      title: "IRJET Published Research Paper",
      subtitle: "A Manuscript based on my team's Final Year Engineering Project published in International Research Journal of Engineering and Technology",
      link: "https://www.irjet.net/archives/V7/i7/IRJET-V7I7285.pdf"
    },
    {
      title: "Rakathon - 2D to 3D View Conversion",
      subtitle: "An innovation application to convert 2-D images into real-time 3-D interactive perspectives",
      link: "https://drive.google.com/file/d/1b0gMXkVoNRCR4au2hVUcAXOCoWH1h_9E/view"
    }
  ];

  const blogs = [
    {
      title: "Gratitude for Being Born in the Ancient Civilization of Bharatavarsha",
      desc: "Starting with gratitude by giving salutations to Lord Ganesha - reflections on our rich civilizational heritage and unbroken wisdom.",
      url: "https://sughoshblog.vercel.app/blogs/gratitude-for-being-born-in-the-ancient-civilization-of-bharatavarsha"
    },
    {
      title: "Reflections from the Akhila Bharateeya Pratinidhi Sabha 2025",
      desc: "My experience at the 100th year centenary of RSS as a Prabandhak - insights on disciplined leadership, nation-building, and selfless service.",
      url: "https://sughoshblog.vercel.app/blogs/reflections-from-the-akhila-bharateeya-pratinidhi-sabha-2025"
    },
    {
      title: "A Heartfelt Ode and a Tribute to Ajjju",
      desc: "Lifestory of Ajju - a touching tribute to a beloved grandfather and brave soul whose life embodied courage and righteousness.",
      url: "https://sughoshblog.vercel.app/blogs/a-heartfelt-ode-and-a-tribute-to-ajjju"
    },
    {
      title: "India in a Shifting Global Order — Book Notes",
      desc: "A comprehensive analytical breakdown of a book exploring the Indian strategic perspective in the rapidly changing multipolar geopolitical order.",
      url: "https://sughoshblog.vercel.app/blogs/india-in-a-shifting-global-order-book-notes"
    },
    {
      title: "Five Years at Oracle: From Cloud Analyst to Data Scientist",
      desc: "My journey at Oracle from being a fresh engineering graduate to architecting AI and machine learning solutions for financial crime detection.",
      url: "https://sughoshblog.vercel.app/blogs/five-years-at-oracle:-from-cloud-analyst-to-data-scientist"
    },
    {
      title: "Do You Watch Football? Liverpool FC Devotion",
      desc: "A reflection on why I chose to support Liverpool F.C., the beautiful game vs the lazy game, and the profound philosophy of 'You'll Never Walk Alone'.",
      url: "https://sughoshdixit.blogspot.com/p/being-ardent-liverpool-fan-i-can-tell.html"
    }
  ];

  const youtubeVideos = [
    { id: "vX5sqN4Wl78", title: "Sughosh Dixit - YouTube Spotlight" },
    { id: "rrbSLCis0QY", title: "Data Science & AI Perspectives" },
    { id: "u1PtafSwvwg", title: "TechJourney Series: Path to Data Scientist" },
    { id: "yXQAM2jsYgA", title: "Cracking Data Science and AI with Sughosh Dixit" }
  ];

  const aiGalleryImages = [
    { src: "/ai-gallery/2025myyear.jpg", desc: "AI-generated celebration of 2025" },
    { src: "/ai-gallery/knee slide.jpg", desc: "Dynamic knee slide celebration with AI" },
    { src: "/ai-gallery/LFC.jpg", desc: "Liverpool FC themed artwork" },
    { src: "/ai-gallery/out-0 (13).webp", desc: "Abstract digital geometry" },
    { src: "/ai-gallery/out-0 (25).webp", desc: "Visual composition exploration" },
    { src: "/ai-gallery/out-0 (3).webp", desc: "Digital textures & lighting" },
    { src: "/ai-gallery/RM-5.jpg", desc: "Creative AI illustration RM-5" },
    { src: "/ai-gallery/WhatsApp Image 2025-03-04 at 11.42.56.jpeg", desc: "Enhanced captured portrait" }
  ];

  return (
    <div className="portfolio-app-root bg-[#FAF8F6] dark:bg-[#161513] text-[#161513] dark:text-[#F5F4F2] min-h-screen font-sans -mx-4 sm:-mx-8 -my-6 pb-20 transition-colors duration-300">
      <style>{`
        /* EXACT STYLING FROM SughoshDixit.github.io */
        .identity-cards-wrapper {
          padding: 30px 12px;
          margin: 20px 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 50%, rgba(255, 255, 255, 0.95) 100%);
          border-radius: 24px;
        }
        .dark-mode .identity-cards-wrapper,
        :root[data-theme="dark"] .identity-cards-wrapper {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(33, 37, 41, 0.95) 50%, rgba(26, 26, 26, 0.95) 100%);
        }

        .cards-title-heading {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #55198B 0%, #007ACC 50%, #FFD700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          margin-bottom: 8px;
          position: relative;
          display: inline-block;
        }

        .title-underline-bar {
          width: 70px;
          height: 4px;
          background: linear-gradient(90deg, #55198B 0%, #007ACC 50%, #FFD700 100%);
          border-radius: 2px;
          margin: 6px auto 14px;
        }

        .identity-card-item {
          background: #ffffff;
          border-radius: 24px;
          padding: 24px 18px 20px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid transparent;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 6px rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
        }
        .dark-mode .identity-card-item,
        :root[data-theme="dark"] .identity-card-item {
          background: #1f232b;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .identity-card-item:hover,
        .identity-card-item.active {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--card-color);
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.14);
        }

        .card-icon-circle {
          position: relative;
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-ring-pulse {
          position: absolute;
          inset: 0;
          border: 2.5px solid var(--card-color);
          border-radius: 50%;
          opacity: 0.35;
          animation: ringPulse 2s infinite;
        }

        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.12); opacity: 0.7; }
        }

        .wave-hand-emoji {
          animation: waveHand 1.8s infinite;
          display: inline-block;
          transform-origin: 70% 70%;
        }

        @keyframes waveHand {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-14deg); }
          20% { transform: rotate(14deg); }
          30% { transform: rotate(-14deg); }
          40% { transform: rotate(10deg); }
          50% { transform: rotate(0deg); }
        }

        .shimmer-progress {
          position: relative;
          overflow: hidden;
        }
        .shimmer-progress::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          animation: shimmerSweep 2s infinite;
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .purple-btn-master {
          background-color: #55198B;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(85, 25, 139, 0.35);
          transition: all 0.2s ease;
        }
        .purple-btn-master:hover {
          background-color: #8C43CE;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(140, 67, 206, 0.5);
        }
      `}</style>

      {/* ------------------------------------------------------------------- */}
      {/* 1. PORTFOLIO TOP NAVIGATION (PIXEL-PERFECT MOBILE) */}
      {/* ------------------------------------------------------------------- */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#1f232b]/95 backdrop-blur-md border-b border-black/5 dark:border-white/10 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => scrollToSection('greeting')}
            className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[#161513] dark:text-white"
          >
            <span className="text-[#55198B] dark:text-[#8C43CE]">&lt;</span>
            <span className="px-1 text-[#007ACC]">Sughosh Dixit</span>
            <span className="text-[#55198B] dark:text-[#8C43CE]">/&gt;</span>
          </button>

          {/* Direct Resume Button */}
          <a
            href="https://drive.google.com/file/d/1Do_Aj8ruhq64P7Enq4giaJhtXpRcsHG2/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="purple-btn-master px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Resume 📄
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 pt-6">
        {/* ------------------------------------------------------------------- */}
        {/* 2. GREETING SECTION */}
        {/* ------------------------------------------------------------------- */}
        <section id="greeting" className="pt-4 text-center sm:text-left grid gap-8 sm:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[#161513] dark:text-white">
              नमस्ते, Sughosh here <span className="wave-hand-emoji">👋</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#5a6c7d] dark:text-slate-300 leading-relaxed font-medium">
              🧠 <strong>Data Scientist</strong> at Oracle Financial Crime &amp; Compliance &bull; 
              🎵 <strong className="text-amber-500">Bhajan Singer</strong> &amp; Patriotic Music Enthusiast &bull; 
              ⚽ <strong className="text-emerald-600 dark:text-emerald-400">Passionate Footballer</strong> &amp; Liverpool FC Devotee &bull; 
              🇮🇳 <strong className="text-purple-600 dark:text-purple-400">Proud Indian Nationalist</strong> &bull; 
              🎓 <strong className="text-blue-600 dark:text-blue-400">M.Tech Data Science</strong> from BITS Pilani.
            </p>

            {/* Social Media Link Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
              <a href="https://github.com/SughoshDixit9" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-[#333] hover:text-white text-slate-700 dark:text-slate-200 transition-all shadow-xs" title="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/sughosh-dixit/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-[#0077b5] hover:text-white text-slate-700 dark:text-slate-200 transition-all shadow-xs" title="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="mailto:sughoshpdixit@gmail.com" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-[#ea4335] hover:text-white text-slate-700 dark:text-slate-200 transition-all shadow-xs" title="Gmail">
                <Mail size={16} />
              </a>
              <a href="https://www.instagram.com/sughoshdixit/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-[#e4405f] hover:text-white text-slate-700 dark:text-slate-200 transition-all shadow-xs" title="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://medium.com/@sughoshpdixit" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-black hover:text-white text-slate-700 dark:text-slate-200 transition-all shadow-xs font-bold text-xs" title="Medium">
                M
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
              <button
                onClick={() => scrollToSection('contact')}
                className="purple-btn-master px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider"
              >
                Contact Me ☎️
              </button>
              <button
                onClick={() => scrollToSection('identity-pillars')}
                className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white transition-all"
              >
                Explore 4 Pillars 🏛️
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#55198B]/20 via-[#007ACC]/20 to-[#FFD700]/20 p-3 shadow-xl border border-white/20 flex items-center justify-center">
              <img
                src="/portfolio-assets/manOnTable.svg"
                alt="Sughosh Dixit Developer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 3. MY FOUR PILLARS OF IDENTITY (EXACT CLONE OF SCREENSHOT 2) */}
        {/* ------------------------------------------------------------------- */}
        <section id="identity-pillars" className="identity-cards-wrapper border border-black/5 dark:border-white/10 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="cards-title-heading">
              My Four Pillars of Identity
            </h2>
            <div className="title-underline-bar"></div>
            <p className="text-xs sm:text-sm text-[#7f8c8d] dark:text-slate-400 font-medium">
              Click on any pillar to explore deeper
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {identities.map((item, index) => {
              const isActive = activeIdentityIndex === index;
              return (
                <div
                  key={item.title}
                  onClick={() => setActiveIdentityIndex(index)}
                  className={`identity-card-item ${isActive ? 'active' : ''}`}
                  style={
                    {
                      '--card-color': item.color,
                      '--card-color-rgb': item.colorRgb
                    } as React.CSSProperties
                  }
                >
                  {/* Card Icon with Pulsing Ring */}
                  <div className="card-icon-circle">
                    <span className="text-3xl z-10">{item.icon}</span>
                    <div className="icon-ring-pulse"></div>
                  </div>

                  {/* Card Info */}
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-black text-[#1a1a1a] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#7f8c8d] dark:text-slate-300 leading-relaxed min-h-[3rem]">
                      {item.description}
                    </p>

                    {/* Stats: Experience & Level */}
                    <div className="flex justify-center gap-6 py-2">
                      <div className="text-center">
                        <span className="block text-xl font-black" style={{ color: item.color }}>
                          {item.experience}
                        </span>
                        <span className="block text-[10px] text-[#7f8c8d] uppercase tracking-wider font-bold">
                          Years
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xl font-black" style={{ color: item.color }}>
                          {item.level}
                        </span>
                        <span className="block text-[10px] text-[#7f8c8d] uppercase tracking-wider font-bold">
                          Level
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 justify-center py-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold border"
                          style={{
                            color: item.color,
                            backgroundColor: `rgba(${item.colorRgb}, 0.08)`,
                            borderColor: `rgba(${item.colorRgb}, 0.2)`
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Shimmer Progress Bar */}
                    <div className="pt-2">
                      <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden shimmer-progress">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.progress}%`,
                            backgroundColor: item.color
                          }}
                        ></div>
                      </div>
                      <span className="block text-[10px] font-bold mt-1 text-center" style={{ color: item.color }}>
                        {item.progress}% Mastery
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Card Expanded Details */}
          {identities[activeIdentityIndex] && (
            <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-[#1a1d24] border border-black/5 dark:border-white/10 shadow-lg animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-black/5 dark:border-white/10">
                <span className="text-3xl">{identities[activeIdentityIndex].icon}</span>
                <div>
                  <h3 className="text-xl font-black text-[#1a1a1a] dark:text-white">
                    {identities[activeIdentityIndex].title} Details
                  </h3>
                  <span className="text-xs text-[#7f8c8d] dark:text-slate-400">
                    {identities[activeIdentityIndex].level} &bull; {identities[activeIdentityIndex].progress}% Mastery
                  </span>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3 pt-5 text-left">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Achievements
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#2c3e50] dark:text-slate-200">
                    {identities[activeIdentityIndex].achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span style={{ color: identities[activeIdentityIndex].color }}>▶</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Current Focus
                  </h4>
                  <p className="text-xs text-[#2c3e50] dark:text-slate-200 leading-relaxed">
                    {identities[activeIdentityIndex].currentFocus}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Guiding Philosophy
                  </h4>
                  <div
                    className="p-3 rounded-xl italic text-xs leading-relaxed"
                    style={{
                      backgroundColor: `rgba(${identities[activeIdentityIndex].colorRgb}, 0.06)`,
                      borderLeft: `4px solid ${identities[activeIdentityIndex].color}`,
                      color: identities[activeIdentityIndex].color
                    }}
                  >
                    "{identities[activeIdentityIndex].philosophy}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 4. SOFTWARE SKILLS */}
        {/* ------------------------------------------------------------------- */}
        <section id="skills" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white">
              Technical Skills ⚡
            </h2>
            <p className="text-xs text-[#7f8c8d] mt-1">Tools and frameworks powering modern AI solutions</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {softwareSkills.map((sk) => (
              <div
                key={sk.name}
                className="p-4 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between hover:scale-105 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{sk.icon}</span>
                  <span className="text-xs font-bold text-[#1a1a1a] dark:text-white">{sk.name}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${sk.progress}%`, backgroundColor: sk.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 5. EDUCATION & WORK EXPERIENCE */}
        {/* ------------------------------------------------------------------- */}
        <section id="experience" className="grid gap-8 md:grid-cols-2">
          {/* Education */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-[#007ACC]" size={20} />
              <h2 className="text-xl font-black text-[#1a1a1a] dark:text-white">Education</h2>
            </div>

            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.schoolName} className="p-4 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-[#007ACC] uppercase tracking-wider">{edu.duration}</span>
                  <h3 className="text-sm font-black text-[#1a1a1a] dark:text-white">{edu.schoolName}</h3>
                  <p className="text-xs font-bold text-[#5a6c7d] dark:text-slate-300">{edu.degree}</p>
                  <p className="text-[11px] text-[#7f8c8d] leading-relaxed">{edu.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-[#FFD700]" size={20} />
              <h2 className="text-xl font-black text-[#1a1a1a] dark:text-white">Experience</h2>
            </div>

            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.role + exp.company}
                  className="p-4 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs space-y-1.5 border-l-4"
                  style={{ borderLeftColor: exp.color }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{exp.date}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {exp.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#1a1a1a] dark:text-white">{exp.role}</h3>
                  <p className="text-xs font-bold text-[#007ACC]">{exp.company}</p>
                  <p className="text-[11px] text-[#7f8c8d] dark:text-slate-400 leading-relaxed">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 6. FEATURED PROJECTS & ACHIEVEMENTS */}
        {/* ------------------------------------------------------------------- */}
        <section id="projects" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white">
              Featured Projects 💻
            </h2>
            <p className="text-xs text-[#7f8c8d] mt-1">High-impact engineering, data science & anti-fraud platforms</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div
                key={p.name}
                className="p-5 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#007ACC] transition-all"
              >
                <div className="space-y-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
                    {p.category}
                  </span>
                  <h3 className="text-sm font-black text-[#1a1a1a] dark:text-white">{p.name}</h3>
                  <p className="text-xs text-[#7f8c8d] dark:text-slate-400 line-clamp-3 leading-relaxed">{p.desc}</p>
                </div>

                <div className="pt-3 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {p.tech.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[9px] font-mono text-slate-600 dark:text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>

                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#007ACC] hover:underline pt-1"
                  >
                    <span>View Details</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 7. ACHIEVEMENTS & CERTIFICATIONS */}
        {/* ------------------------------------------------------------------- */}
        <section id="achievements" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white">
              Achievements &amp; Certifications 🏆
            </h2>
            <p className="text-xs text-[#7f8c8d] mt-1">Hackathons, published research, and innovation awards</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {achievements.map((ach) => (
              <div
                key={ach.title}
                className="p-5 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  <h3 className="text-sm font-black text-[#1a1a1a] dark:text-white">{ach.title}</h3>
                  <p className="text-xs text-[#7f8c8d] dark:text-slate-400 leading-relaxed">{ach.subtitle}</p>
                </div>

                <div className="pt-3">
                  <a
                    href={ach.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 hover:underline"
                  >
                    <span>View Certificate / Paper</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 8. BLOGS & ESSAYS */}
        {/* ------------------------------------------------------------------- */}
        <section id="blogs" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white">
              Blogs &amp; Essays 📝
            </h2>
            <p className="text-xs text-[#7f8c8d] mt-1">Reflections on civilization, geopolitics, and football</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <a
                key={b.title}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs hover:border-[#55198B] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <BookOpen size={16} className="text-[#55198B] mb-1" />
                  <h3 className="text-xs font-bold text-[#1a1a1a] dark:text-white group-hover:text-[#55198B] leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-[#7f8c8d] dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#007ACC] pt-2">
                  Read More &rarr;
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 8. YOUTUBE & AI GALLERY */}
        {/* ------------------------------------------------------------------- */}
        <section id="youtube" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white">
              YouTube &amp; AI Creative Gallery 🎨
            </h2>
            <p className="text-xs text-[#7f8c8d] mt-1">Data science podcasts &amp; generative AI art experiments</p>
          </div>

          {/* YouTube Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {youtubeVideos.map((v) => (
              <div key={v.id} className="rounded-2xl overflow-hidden bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs">
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    title={v.title}
                    src={`https://www.youtube.com/embed/${v.id}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] font-bold text-[#1a1a1a] dark:text-white line-clamp-1">{v.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Gallery Images */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {aiGalleryImages.map((img, i) => (
              <div
                key={i}
                onClick={() => setPreviewImage(img.src)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:scale-105 transition-all cursor-pointer group"
              >
                <img
                  src={img.src}
                  alt={img.desc}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                  <p className="text-[10px] text-white font-medium line-clamp-2">{img.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------- */}
        {/* 9. CONTACT & FOOTER */}
        {/* ------------------------------------------------------------------- */}
        <section id="contact" className="p-6 rounded-3xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white">Contact Me ☎️</h2>
          <p className="text-xs text-[#7f8c8d]">Let's collaborate, build innovative AI tools &amp; celebrate heritage!</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold">
            <a href="tel:+918310080859" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline">
              <Phone size={14} />
              <span>+91-8310080859</span>
            </a>
            <a href="mailto:sughoshpdixit@gmail.com" className="flex items-center gap-1.5 text-[#007ACC] hover:underline">
              <Mail size={14} />
              <span>sughoshpdixit@gmail.com</span>
            </a>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <a href="https://github.com/SughoshDixit9" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-[#333] hover:text-white transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/sughosh-dixit/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://www.instagram.com/sughoshdixit/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-[#e4405f] hover:bg-[#e4405f] hover:text-white transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>

          <p className="text-[10px] text-[#7f8c8d] pt-2">
            Made with ❤️ by Sughosh Dixit &bull; All Rights Reserved
          </p>
        </section>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-lg max-h-[85vh] p-2 bg-white dark:bg-[#1f232b] rounded-2xl">
            <button onClick={() => setPreviewImage(null)} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white">
              <X size={16} />
            </button>
            <img src={previewImage} alt="Preview" className="max-h-[75vh] w-auto rounded-xl object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
