import React, { useState } from 'react';
import {
  ExternalLink,
  Mail,
  GraduationCap,
  Trophy,
  BookOpen,
  ChevronRight,
  Sparkles,
  Phone,
  X
} from 'lucide-react';

interface SughoshDixitPortfolioTabProps {
  onOpenCreatePost?: () => void;
}

export const SughoshDixitPortfolioTab: React.FC<SughoshDixitPortfolioTabProps> = () => {
  const [selectedIdentity, setSelectedIdentity] = useState<number>(0);
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
      bgColor: "rgba(0, 122, 204, 0.12)",
      borderColor: "rgba(0, 122, 204, 0.4)",
      experience: "4+",
      level: "Expert",
      progress: 95,
      tags: ["AI/ML", "Python", "SQL", "Analytics", "AML/FCCM"],
      achievements: [
        "Built ML models for fraud detection & Anti-Money Laundering",
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
      bgColor: "rgba(255, 215, 0, 0.12)",
      borderColor: "rgba(255, 215, 0, 0.4)",
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
      bgColor: "rgba(34, 139, 34, 0.12)",
      borderColor: "rgba(34, 139, 34, 0.4)",
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
      bgColor: "rgba(85, 25, 139, 0.15)",
      borderColor: "rgba(85, 25, 139, 0.4)",
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
    { name: "Data Science & ML", icon: "🧠", color: "#007ACC" },
    { name: "Python & AI", icon: "🐍", color: "#3776AB" },
    { name: "SQL & Analytics", icon: "🗄️", color: "#336791" },
    { name: "React & Frontend", icon: "⚛️", color: "#61DAFB" },
    { name: "Oracle Cloud", icon: "☁️", color: "#F80000" },
    { name: "Music & Bhajans", icon: "🎵", color: "#FFD700" },
    { name: "Football Strategy", icon: "⚽", color: "#228B22" },
    { name: "Indian Heritage", icon: "🕉️", color: "#FF9933" }
  ];

  const techStackBars = [
    { stack: "🧠 Data Science & AI/ML", percentage: 95, color: "#007ACC" },
    { stack: "🎵 Musical Performance & Cultural Arts", percentage: 90, color: "#FFD700" },
    { stack: "⚽ Football Strategy & Leadership", percentage: 85, color: "#228B22" },
    { stack: "🇮🇳 Cultural Heritage & Nationalist Thought", percentage: 90, color: "#55198B" },
    { stack: "💻 Full-Stack Development", percentage: 80, color: "#61DAFB" },
    { stack: "🔒 Financial Crime Detection Systems", percentage: 88, color: "#28A745" }
  ];

  const education = [
    {
      schoolName: "BITS PILANI",
      degree: "Master of Technology in Data Science and Engineering",
      duration: "September 2021 - September 2023",
      desc: "Hustled through work and studies with a focus on AI-driven projects",
      bullets: ["Collaborated on cutting-edge AI/ML models"]
    },
    {
      schoolName: "Bangalore Institute of Technology",
      degree: "Bachelor of Technology in Information Science and Engineering",
      duration: "September 2016 - April 2020",
      desc: "Top 10% in program, developing deep foundations in engineering",
      bullets: ["Worked on impactful internships and hackathons"]
    }
  ];

  const experiences = [
    {
      role: "Data Scientist",
      company: "Oracle Financial Crime and Compliance Management",
      date: "October 2024 – Present",
      desc: "Building Machine Learning models to combat financial crimes and optimize Anti-Money Laundering efforts. 🌐💼",
      bullets: [
        "Analyzing financial data for fraud detection",
        "Developing predictive models to detect suspicious transactions",
        "Collaborating with cross-functional teams for risk mitigation"
      ],
      tag: "Current Role",
      color: "border-blue-500"
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
      color: "border-red-500"
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
      color: "border-emerald-500"
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
      color: "border-amber-500"
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
    <div className="portfolio-app-root bg-[#0c1017] text-[#f8fafc] min-h-screen font-sans -mx-4 sm:-mx-8 -my-6 pb-20">
      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0px); filter: drop-shadow(0 0 15px rgba(85, 25, 139, 0.4)); }
          50% { transform: translateY(-8px); filter: drop-shadow(0 0 25px rgba(0, 229, 255, 0.6)); }
        }
        .animate-float-glow {
          animation: floatGlow 4s ease-in-out infinite;
        }
        .portfolio-gradient-text {
          background: linear-gradient(135deg, #00e5ff 0%, #7c4dff 50%, #ffab00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .purple-gradient-btn {
          background: linear-gradient(135deg, #55198b 0%, #8c43ce 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(85, 25, 139, 0.4);
          transition: all 0.2s ease;
        }
        .purple-gradient-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(140, 67, 206, 0.6);
        }
      `}</style>

      {/* ------------------------------------------------------------------- */}
      {/* 1. PORTFOLIO TOP NAVIGATION */}
      {/* ------------------------------------------------------------------- */}
      <nav className="sticky top-0 z-40 bg-[#131924]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => scrollToSection('greeting')}
            className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white hover:opacity-80 transition-opacity"
          >
            <span className="text-[#00e5ff]">&lt;</span>
            <span> Sughosh Dixit </span>
            <span className="text-[#7c4dff]">/&gt;</span>
          </button>

          <div className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
            <button onClick={() => scrollToSection('skills')} className="hover:text-[#00e5ff] transition-colors">Skills</button>
            <button onClick={() => scrollToSection('education')} className="hover:text-[#00e5ff] transition-colors">Education</button>
            <button onClick={() => scrollToSection('experience')} className="hover:text-[#00e5ff] transition-colors">Experience</button>
            <button onClick={() => scrollToSection('projects')} className="hover:text-[#00e5ff] transition-colors">Projects</button>
            <button onClick={() => scrollToSection('achievements')} className="hover:text-[#00e5ff] transition-colors">Achievements</button>
            <button onClick={() => scrollToSection('blogs')} className="hover:text-[#00e5ff] transition-colors">Blogs</button>
            <button onClick={() => scrollToSection('talks')} className="hover:text-[#00e5ff] transition-colors">Hymns</button>
            <button onClick={() => scrollToSection('youtube')} className="hover:text-[#00e5ff] transition-colors">Videos</button>
            <button onClick={() => scrollToSection('ai-gallery')} className="hover:text-[#00e5ff] transition-colors">AI Gallery</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-[#00e5ff] transition-colors">Contact</button>
          </div>

          <a
            href="https://drive.google.com/file/d/1Do_Aj8ruhq64P7Enq4giaJhtXpRcsHG2/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="purple-gradient-btn px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            Resume
          </a>
        </div>
      </nav>

      {/* ------------------------------------------------------------------- */}
      {/* 2. GREETING / HERO SECTION */}
      {/* ------------------------------------------------------------------- */}
      <section id="greeting" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 grid gap-12 lg:grid-cols-[1.3fr_1fr] items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#00e5ff]">
            <Sparkles size={14} />
            <span>Multi-Identity Developer & Athlete Portfolio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            नमस्ते, <span className="portfolio-gradient-text">Sughosh</span> here <span className="inline-block animate-bounce">👋</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl bg-[#131924]/80 p-5 rounded-2xl border border-white/5 shadow-xl">
            🧠 <strong className="text-white">Data Scientist</strong> at Oracle Financial Crime &amp; Compliance &bull; 
            🎵 <strong className="text-amber-400">Bhajan Singer</strong> &amp; Patriotic Music Enthusiast &bull; 
            ⚽ <strong className="text-emerald-400">Passionate Footballer</strong> &amp; Liverpool FC Devotee &bull; 
            🇮🇳 <strong className="text-orange-400">Proud Indian Nationalist</strong> &amp; Civilizational Heritage Advocate &bull; 
            🎓 <strong className="text-cyan-400">Masters in Data Science</strong> from BITS Pilani.
          </p>

          {/* Social Media Link Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a href="https://github.com/SughoshDixit9" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-[#131924] border border-white/10 hover:border-[#00e5ff] text-white transition-all shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/sughosh-dixit/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-[#131924] border border-white/10 hover:border-[#0077b5] text-[#0077b5] transition-all shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="mailto:sughoshpdixit@gmail.com" className="p-3 rounded-full bg-[#131924] border border-white/10 hover:border-[#ea4335] text-[#ea4335] transition-all shadow-md">
              <Mail size={16} />
            </a>
            <a href="https://www.instagram.com/sughoshdixit/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-[#131924] border border-white/10 hover:border-[#e4405f] text-[#e4405f] transition-all shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://medium.com/@sughoshpdixit" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-[#131924] border border-white/10 hover:border-white text-white transition-all shadow-md font-bold text-xs">
              M
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => scrollToSection('contact')}
              className="purple-gradient-btn px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider"
            >
              Contact Me ☎️
            </button>
            <a
              href="https://drive.google.com/file/d/1Do_Aj8ruhq64P7Enq4giaJhtXpRcsHG2/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-black uppercase tracking-wider text-white transition-all"
            >
              See My Resume 📄
            </a>
          </div>
        </div>

        {/* Right Hero Interactive Graphic */}
        <div className="flex justify-center">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl bg-gradient-to-br from-[#55198b]/30 via-[#007acc]/20 to-[#228b22]/30 border border-white/20 p-8 flex flex-col items-center justify-center text-center shadow-2xl animate-float-glow">
            <div className="w-24 h-24 rounded-full bg-[#55198b] text-white flex items-center justify-center text-3xl font-black shadow-xl mb-4 border-2 border-white/30">
              SD
            </div>
            <h3 className="text-xl font-black text-white font-mono">&lt; Sughosh Dixit /&gt;</h3>
            <p className="text-xs text-slate-300 mt-2">Oracle Data Scientist &bull; Bharatiya Musician &bull; Winger Striker</p>
            <div className="flex gap-2 mt-4">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">AI/ML</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">Music</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">LFC</span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">Bharat</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 3. MULTI-IDENTITY 4 PILLARS SHOWCASE */}
      {/* ------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            My Four Pillars of Identity 🏛️
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A harmonious synthesis of scientific rigor, cultural devotion, athletic grit, and civilizational pride.
          </p>
        </div>

        {/* Identity Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {identities.map((id, index) => (
            <button
              key={id.title}
              onClick={() => setSelectedIdentity(index)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedIdentity === index
                  ? 'border-white bg-white/10 shadow-lg scale-105'
                  : 'border-white/5 bg-[#131924] hover:bg-white/5 opacity-70'
              }`}
              style={{
                borderColor: selectedIdentity === index ? id.color : undefined
              }}
            >
              <div className="text-2xl mb-1">{id.icon}</div>
              <h3 className="text-sm font-black text-white">{id.title}</h3>
              <span className="text-[10px] text-slate-400">{id.level}</span>
            </button>
          ))}
        </div>

        {/* Selected Identity Detail Box */}
        {(() => {
          const cur = identities[selectedIdentity];
          return (
            <div
              className="rounded-3xl p-6 sm:p-8 border transition-all shadow-2xl"
              style={{
                backgroundColor: cur.bgColor,
                borderColor: cur.borderColor
              }}
            >
              <div className="grid gap-6 md:grid-cols-2 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{cur.icon}</span>
                    <div>
                      <h3 className="text-2xl font-black text-white">{cur.title}</h3>
                      <p className="text-xs text-slate-300">{cur.description}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
                    <p className="text-xs italic text-amber-200">"{cur.philosophy}"</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Achievements</h4>
                    <ul className="space-y-1.5">
                      {cur.achievements.map((ach, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">&check;</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/10">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Proficiency &amp; Mastery</span>
                      <span style={{ color: cur.color }}>{cur.progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${cur.progress}%`, backgroundColor: cur.color }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Focus</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{cur.currentFocus}</p>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Domains &amp; Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cur.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 4. SKILLS & PROFICIENCY BARS */}
      {/* ------------------------------------------------------------------- */}
      <section id="skills" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Software &amp; Domain Expertise ⚡
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Cutting-edge tools, engineering stacks, and multidimensional skill proficiencies.
          </p>
        </div>

        {/* Animated Skill Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {softwareSkills.map((sk) => (
            <div
              key={sk.name}
              className="p-5 rounded-2xl bg-[#131924] border border-white/5 hover:border-white/20 hover:scale-105 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-lg"
            >
              <span className="text-3xl">{sk.icon}</span>
              <span className="text-xs font-bold text-white">{sk.name}</span>
            </div>
          ))}
        </div>

        {/* Proficiency Progress Bars */}
        <div className="bg-[#131924] p-6 sm:p-8 rounded-3xl border border-white/10 max-w-4xl mx-auto space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#00e5ff] mb-4">
            Multi-Dimensional Proficiency Metrics
          </h3>
          <div className="space-y-3.5">
            {techStackBars.map((bar) => (
              <div key={bar.stack} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{bar.stack}</span>
                  <span>{bar.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${bar.percentage}%`, backgroundColor: bar.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 5. EDUCATION SECTION */}
      {/* ------------------------------------------------------------------- */}
      <section id="education" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Academic Excellence 🎓
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Deep theoretical foundation combined with industrial research at premier institutions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {education.map((edu) => (
            <div key={edu.schoolName} className="p-6 sm:p-8 rounded-3xl bg-[#131924] border border-white/10 hover:border-[#00e5ff]/50 transition-all shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{edu.schoolName}</h3>
                  <span className="text-xs text-slate-400">{edu.duration}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-cyan-300">{edu.degree}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{edu.desc}</p>
              <ul className="space-y-1">
                {edu.bullets.map((b, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-cyan-400">&bull;</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 6. WORK EXPERIENCES */}
      {/* ------------------------------------------------------------------- */}
      <section id="experience" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Work Experience 💼
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Industrial impact across enterprise financial systems, cloud analytics, and innovative startups.
          </p>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {experiences.map((exp) => (
            <div
              key={exp.role + exp.company}
              className={`p-6 sm:p-8 rounded-3xl bg-[#131924] border-l-4 ${exp.color} border border-white/10 shadow-xl space-y-3`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black text-white">{exp.role}</h3>
                  <h4 className="text-sm font-bold text-[#00e5ff]">{exp.company}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold">
                    {exp.date}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                    {exp.tag}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{exp.desc}</p>

              <ul className="space-y-1 pt-1">
                {exp.bullets.map((b, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="text-emerald-400">&bull;</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 7. BIG PROJECTS & SHOWCASE */}
      {/* ------------------------------------------------------------------- */}
      <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Featured Projects 💻
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Creating high-impact data-driven platforms, anti-money laundering AI, and enterprise cloud tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.name}
              className="p-6 rounded-3xl bg-[#131924] border border-white/10 hover:border-[#7c4dff]/50 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  {p.category}
                </span>
                <h3 className="text-lg font-black text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{p.desc}</p>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex flex-wrap gap-1">
                  {p.tech.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] font-mono">
                      {t}
                    </span>
                  ))}
                </div>

                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00e5ff] hover:underline"
                >
                  <span>Explore Project</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 8. ACHIEVEMENTS & CERTIFICATIONS */}
      {/* ------------------------------------------------------------------- */}
      <section id="achievements" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Achievements &amp; Certifications 🏆
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Hackathons, published papers, and national recognitions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {achievements.map((ach) => (
            <div key={ach.title} className="p-6 rounded-3xl bg-[#131924] border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                  <Trophy size={20} />
                </div>
                <h3 className="text-base font-black text-white">{ach.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ach.subtitle}</p>
              </div>

              <div className="pt-4">
                <a
                  href={ach.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
                >
                  <span>View Credential</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 9. BLOGS SECTION */}
      {/* ------------------------------------------------------------------- */}
      <section id="blogs" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Essays &amp; Tech Insights 📝
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Long-form writing across civilization, technology, geopolitics, and football.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <a
              key={b.title}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-[#131924] border border-white/10 hover:border-[#00e5ff] hover:bg-white/5 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div className="space-y-2">
                <BookOpen size={20} className="text-[#00e5ff] mb-2" />
                <h3 className="text-base font-bold text-white group-hover:text-[#00e5ff] transition-colors leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{b.desc}</p>
              </div>
              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-slate-300 group-hover:text-[#00e5ff]">
                <span>Read Essay</span>
                <ChevronRight size={14} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 10. TALKS & HYMNS SECTION */}
      {/* ------------------------------------------------------------------- */}
      <section id="talks" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Vedic Studies &amp; Hymns 🙏
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            "I aspire to learn as much as Vedas in this lifetime, which is an ocean by itself."
          </p>
        </div>

        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#131924] border border-white/10 text-center space-y-4 shadow-xl">
          <span className="text-4xl">🕉️</span>
          <h3 className="text-xl font-black text-white">Rudra Chant — Sri Rudram Namakam</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sacred Vedic chanting connecting spiritual vibrations and ancient Bharatiya heritage.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a
              href="https://youtu.be/a7IGaWRqB0c"
              target="_blank"
              rel="noopener noreferrer"
              className="purple-gradient-btn px-5 py-2.5 rounded-xl text-xs font-black"
            >
              Watch Video 🎥
            </a>
            <a
              href="https://vignanam.org/kannada/sri-rudram-namakam.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white hover:bg-white/20 transition-all"
            >
              Vedic Script 📜
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 11. YOUTUBE GALLERY */}
      {/* ------------------------------------------------------------------- */}
      <section id="youtube" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            YouTube Gallery 🎥
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Latest uploads, data science podcasts, and tech insights on @sughoshdixit.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {youtubeVideos.map((v) => (
            <div key={v.id} className="rounded-2xl overflow-hidden bg-[#131924] border border-white/10 shadow-xl flex flex-col justify-between">
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  title={v.title}
                  src={`https://www.youtube.com/embed/${v.id}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-200 line-clamp-2">{v.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 12. AI GALLERY */}
      {/* ------------------------------------------------------------------- */}
      <section id="ai-gallery" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            AI Art &amp; Creative Gallery 🎨
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A curated collection of AI-generated images and creative visual experiments.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {aiGalleryImages.map((img, i) => (
            <div
              key={i}
              onClick={() => setPreviewImage(img.src)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-[#00e5ff] cursor-pointer group shadow-lg"
            >
              <img
                src={img.src}
                alt={img.desc}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex items-end">
                <p className="text-[10px] text-white font-medium">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Image Zoom */}
        {previewImage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-2xl max-h-[85vh] p-2 bg-[#131924] rounded-3xl border border-white/20">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X size={18} />
              </button>
              <img src={previewImage} alt="AI Gallery Preview" className="max-h-[75vh] w-auto rounded-2xl object-contain mx-auto" />
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 13. CONTACT & PROFILE SECTION */}
      {/* ------------------------------------------------------------------- */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Contact Me ☎️
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Let's collaborate, innovate, and build high-impact solutions!
          </p>
        </div>

        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-[#131924] border border-white/10 text-center space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Sughosh Dixit</h3>
            <p className="text-xs text-slate-300">Data Scientist &bull; Musician &bull; Footballer &bull; Indian Nationalist</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <a href="tel:+918310080859" className="flex items-center gap-2 text-emerald-400 hover:underline">
              <Phone size={16} />
              <span>+91-8310080859</span>
            </a>
            <a href="mailto:sughoshpdixit@gmail.com" className="flex items-center gap-2 text-cyan-400 hover:underline">
              <Mail size={16} />
              <span>sughoshpdixit@gmail.com</span>
            </a>
          </div>

          {/* Social Row */}
          <div className="flex justify-center gap-4 pt-2">
            <a href="https://github.com/SughoshDixit9" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/sughosh-dixit/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-[#0077b5] transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="https://www.instagram.com/sughoshdixit/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-[#e4405f] transition-all">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* 14. FOOTER */}
      {/* ------------------------------------------------------------------- */}
      <footer className="text-center py-8 text-xs text-slate-500 border-t border-white/5">
        <p>Made with ❤️ by Sughosh Dixit &bull; All Rights Reserved</p>
      </footer>
    </div>
  );
};
