import{H as e,W as t,d as n,dt as r,m as i,pt as a,z as o}from"./index-DokAuHLi.js";var s=e(`external-link`,[[`path`,{d:`M15 3h6v6`,key:`1q9fwt`}],[`path`,{d:`M10 14 21 3`,key:`gplh6r`}],[`path`,{d:`M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`,key:`a6xqqp`}]]),c=e(`mail`,[[`path`,{d:`m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7`,key:`132q7q`}],[`rect`,{x:`2`,y:`4`,width:`20`,height:`16`,rx:`2`,key:`izxlao`}]]),l=e(`phone`,[[`path`,{d:`M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384`,key:`9njp5v`}]]),u=a(r(),1),d=t(),f=()=>{let[e,t]=(0,u.useState)(0),[r,a]=(0,u.useState)(null),[f,p]=(0,u.useState)(!1),[m,h]=(0,u.useState)(!1);(0,u.useEffect)(()=>{let e=()=>{window.scrollY>150?p(!0):p(!1)};return window.addEventListener(`scroll`,e),()=>window.removeEventListener(`scroll`,e)},[]);let g=()=>{h(!0),window.scrollTo({top:0,behavior:`smooth`}),setTimeout(()=>{h(!1)},600)},_=e=>{let t=document.getElementById(e);if(t){let e=t.getBoundingClientRect().top+window.pageYOffset-80;window.scrollTo({top:e,behavior:`smooth`})}},v=[{icon:`🧠`,title:`Data Scientist`,description:`Transforming data into insights at Oracle Financial Crime & Compliance`,color:`#007ACC`,colorRgb:`0, 122, 204`,experience:`4+`,level:`Expert`,progress:95,tags:[`AI/ML`,`Python`,`SQL`,`Analytics`],achievements:[`Built ML models for fraud detection & anti-money laundering`,`Led data extraction for Oracle Cloud HCM`,`Masters in Data Science from BITS Pilani`],currentFocus:`Developing advanced AI models for financial crime prevention and anti-money laundering systems`,philosophy:`Data is the new oil, but insights are the refined fuel that drives innovation`},{icon:`🎵`,title:`Musician`,description:`Devotional singer preserving Bharatiya musical traditions`,color:`#FFD700`,colorRgb:`255, 215, 0`,experience:`10+`,level:`Master`,progress:90,tags:[`Bhajans`,`Patriotic`,`Classical`,`Spiritual`],achievements:[`Weekly bhajan performances & cultural sessions`,`Patriotic song renditions`,`Preserving cultural heritage through music`],currentFocus:`Learning Vedas and expanding repertoire of spiritual and patriotic compositions`,philosophy:`Music is the universal language that connects souls and preserves our cultural essence`},{icon:`⚽`,title:`Footballer`,description:`Passionate striker with offensive mindset and Liverpool FC devotion`,color:`#228B22`,colorRgb:`34, 139, 34`,experience:`15+`,level:`Advanced`,progress:85,tags:[`Striker`,`Liverpool FC`,`Strategy`,`Teamwork`],achievements:[`Offensive footballer with goal-scoring mindset`,`Liverpool FC devotee and tactical analyst`,`Team leadership and high-intensity match play`],currentFocus:`Improving tactical speed, winger agility, and contributing to match success`,philosophy:`Football teaches us that individual brilliance means nothing without team unity and collective purpose`},{icon:`🇮🇳`,title:`Nationalist`,description:`Proud advocate of Bharatiya civilization and cultural heritage`,color:`#55198B`,colorRgb:`85, 25, 139`,experience:`Life`,level:`Devoted`,progress:90,tags:[`Heritage`,`Culture`,`Civilization`,`Pride`],achievements:[`Advocate for Bharatiya civilizational values`,`Working to eradicate colonial consciousness`,`Prabandhak at RSS Centenary ABPS 2025`],currentFocus:`Rebuilding the sense of being a Bharateeya and preserving our civilizational wisdom`,philosophy:`True nationalism is not about being against others, but about being proud of our own magnificent heritage`}];return(0,d.jsxs)(`div`,{className:`portfolio-app-root bg-[#FAF8F6] dark:bg-[#161513] text-[#161513] dark:text-[#F5F4F2] min-h-screen font-['Montserrat',sans-serif] -mx-4 sm:-mx-8 -my-6 pb-24 transition-colors duration-300`,children:[(0,d.jsx)(`style`,{children:`
        /* EXACT Agustina Signature Logo */
        .signature-logo {
          font-family: "Agustina Regular", cursive, sans-serif;
          font-size: 1.05rem;
          font-weight: bold;
          color: #007ACC;
          text-decoration: none;
          letter-spacing: 0.5px;
          line-height: 1.2;
          display: inline-block;
          padding-left: 12px;
          padding-right: 2px;
        }

        .signature-close {
          font-family: monospace;
          color: #55198B;
          font-size: 0.95rem;
          font-weight: bold;
          display: inline-block;
          margin-left: 2px;
        }

        @media (min-width: 640px) {
          .signature-logo {
            font-size: 1.3rem;
            padding-left: 14px;
          }
          .signature-close {
            font-size: 1.15rem;
          }
        }

        .dark-mode .signature-logo,
        :root[data-theme="dark"] .signature-logo {
          color: #00e5ff;
        }

        .dark-mode .signature-close,
        :root[data-theme="dark"] .signature-close {
          color: #8C43CE;
        }

        /* 7 Social Media Icon Circles */
        .social-circle-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          flex-shrink: 0;
        }
        @media (min-width: 480px) {
          .social-circle-btn {
            width: 42px;
            height: 42px;
          }
        }
        .social-circle-btn:hover {
          transform: translateY(-4px) scale(1.12);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }

        /* Hero Action Buttons (Exact Purple Buttons from Screenshot 1) */
        .hero-purple-action-btn {
          background-color: #55198B;
          border: 1px solid #55198B;
          color: #ffffff;
          font-weight: 700;
          padding: 13px 22px;
          text-transform: uppercase;
          border-radius: 6px;
          text-align: center;
          font-size: 0.92rem;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          box-shadow: 0 4px 15px rgba(85, 25, 139, 0.3);
          display: inline-block;
          text-decoration: none;
        }
        .hero-purple-action-btn:hover {
          background-color: #7b29be;
          border-color: #7b29be;
          transform: translateY(-3px);
          box-shadow: 0 8px 22px rgba(85, 25, 139, 0.45);
        }

        /* Multi-Identity Rotating Orb */
        .orb-rotating-container {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .orb-rotating-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #007ACC 0deg, #55198B 90deg, #FFD700 180deg, #228B22 270deg, #007ACC 360deg);
          animation: spinOrb 8s linear infinite;
        }
        @keyframes spinOrb {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* My Four Pillars Exact Styling */
        .identity-cards-wrapper {
          padding: 36px 16px;
          margin: 30px 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 50%, rgba(255, 255, 255, 0.95) 100%);
          border-radius: 28px;
        }
        .dark-mode .identity-cards-wrapper,
        :root[data-theme="dark"] .identity-cards-wrapper {
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(33, 37, 41, 0.95) 50%, rgba(26, 26, 26, 0.95) 100%);
        }

        .cards-title-heading {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #55198B 0%, #007ACC 50%, #FFD700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          margin-bottom: 2px;
          display: inline-block;
        }

        .title-underline-bar {
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #55198B 0%, #007ACC 50%, #FFD700 100%);
          border-radius: 2px;
          margin: 4px auto 6px;
        }

        .identity-card-item {
          background: #ffffff;
          border-radius: 24px;
          padding: 26px 18px 22px;
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
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
        }

        .card-icon-circle {
          position: relative;
          width: 68px;
          height: 68px;
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

        /* Floating Football Scroll to Top Button */
        .football-scroll-btn {
          position: fixed;
          bottom: 30px;
          right: 25px;
          z-index: 999;
          border: none;
          outline: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          width: 52px;
          height: 52px;
          visibility: hidden;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }
        .football-scroll-btn.visible {
          visibility: visible;
          opacity: 1;
          transform: scale(1);
        }
        .football-scroll-btn:hover {
          transform: scale(1.15);
        }
        .football-scroll-btn.animating {
          animation: footballKick 0.6s ease-out;
        }
        @keyframes footballKick {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.25) rotate(-20deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .football-ball-icon {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25), inset 0 2px 5px rgba(255, 255, 255, 0.9);
          border: 2px solid #333333;
          font-size: 24px;
        }
        .football-ball-icon span {
          animation: spinBall 3s linear infinite;
        }
        @keyframes spinBall {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}),(0,d.jsx)(`header`,{className:`sticky top-0 z-40 bg-white/95 dark:bg-[#1f232b]/95 backdrop-blur-md border-b border-black/5 dark:border-white/10 px-6 sm:px-8 py-3.5 shadow-xs`,children:(0,d.jsxs)(`div`,{className:`max-w-4xl mx-auto flex items-center justify-between gap-4`,children:[(0,d.jsxs)(`button`,{onClick:()=>_(`greeting`),className:`flex items-center text-left hover:opacity-85 transition-opacity pl-2 sm:pl-3`,children:[(0,d.jsx)(`span`,{className:`signature-logo`,children:`Sughosh Dixit`}),(0,d.jsx)(`span`,{className:`signature-close`,children:`/>`})]}),(0,d.jsxs)(`div`,{onClick:()=>_(`identity-pillars`),className:`orb-rotating-container shadow-md mr-1 sm:mr-2`,title:`Explore 4 Pillars of Identity`,children:[(0,d.jsx)(`div`,{className:`orb-rotating-ring`}),(0,d.jsx)(`div`,{className:`relative w-8 h-8 rounded-full bg-white dark:bg-[#1a1d24] flex items-center justify-center text-sm z-10 font-bold shadow-xs`,children:`⚡`})]})]})}),(0,d.jsxs)(`main`,{className:`max-w-4xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 space-y-14`,children:[(0,d.jsxs)(`section`,{id:`greeting`,className:`text-center flex flex-col items-center justify-center gap-7 sm:gap-8 pt-4 pb-2 w-full`,children:[(0,d.jsx)(`div`,{className:`w-full flex items-center justify-center text-center px-2`,children:(0,d.jsxs)(`h1`,{className:`text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#161513] dark:text-white leading-snug inline-flex items-center justify-center flex-wrap gap-2 text-center mx-auto`,children:[(0,d.jsx)(`span`,{children:`नमस्ते, Sughosh here`}),` `,(0,d.jsx)(`span`,{className:`wave-hand-emoji text-xl sm:text-2xl`,children:`👋`})]})}),(0,d.jsxs)(`div`,{className:`max-w-2xl mx-auto space-y-3.5 text-slate-700 dark:text-slate-300`,children:[(0,d.jsxs)(`p`,{className:`text-sm sm:text-base md:text-lg leading-relaxed font-medium`,children:[`🧠 `,(0,d.jsx)(`strong`,{className:`text-[#161513] dark:text-white font-bold`,children:`Data Scientist`}),` at Oracle Financial Crime & Compliance`]}),(0,d.jsxs)(`p`,{className:`text-sm sm:text-base md:text-lg leading-relaxed font-medium`,children:[`🎵 `,(0,d.jsx)(`strong`,{className:`text-amber-500 font-bold`,children:`Bhajan Singer`}),` & Patriotic Music Enthusiast • ⚽ `,(0,d.jsx)(`strong`,{className:`text-emerald-600 dark:text-emerald-400 font-bold`,children:`Passionate Footballer`}),` & Liverpool FC Devotee`]}),(0,d.jsxs)(`p`,{className:`text-sm sm:text-base md:text-lg leading-relaxed font-medium`,children:[`🇮🇳 `,(0,d.jsx)(`strong`,{className:`text-purple-600 dark:text-purple-400 font-bold`,children:`Proud Indian Nationalist`}),` & Civilizational Heritage Advocate`]}),(0,d.jsxs)(`p`,{className:`text-sm sm:text-base md:text-lg leading-relaxed font-medium`,children:[`🎓 `,(0,d.jsx)(`strong`,{className:`text-blue-600 dark:text-blue-400 font-bold`,children:`Masters in Data Science`}),` from BITS Pilani. Building AI-driven solutions while preserving Bharatiya culture & values 🌍🏆`]})]}),(0,d.jsx)(`div`,{className:`w-full flex items-center justify-center`,children:(0,d.jsxs)(`div`,{className:`flex items-center justify-center flex-nowrap gap-3 sm:gap-4 max-w-full px-2 overflow-x-auto`,children:[(0,d.jsx)(`a`,{href:`https://github.com/SughoshDixit9`,target:`_blank`,rel:`noopener noreferrer`,className:`social-circle-btn bg-[#333333]`,title:`GitHub`,children:(0,d.jsx)(`svg`,{className:`w-4 sm:w-5 h-4 sm:h-5 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z`})})}),(0,d.jsx)(`a`,{href:`https://www.linkedin.com/in/sughosh-dixit/`,target:`_blank`,rel:`noopener noreferrer`,className:`social-circle-btn bg-[#0077B5]`,title:`LinkedIn`,children:(0,d.jsx)(`svg`,{className:`w-4 sm:w-5 h-4 sm:h-5 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z`})})}),(0,d.jsx)(`a`,{href:`mailto:sughoshpdixit@gmail.com`,className:`social-circle-btn bg-[#EA4335]`,title:`Gmail`,children:(0,d.jsx)(c,{size:16})}),(0,d.jsx)(`a`,{href:`https://gitlab.com`,target:`_blank`,rel:`noopener noreferrer`,className:`social-circle-btn bg-[#FCA326]`,title:`GitLab`,children:(0,d.jsx)(`svg`,{className:`w-4 sm:w-5 h-4 sm:h-5 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.444a.92.92 0 0 0 .331-1.023z`})})}),(0,d.jsx)(`a`,{href:`https://www.instagram.com/sughoshdixit/`,target:`_blank`,rel:`noopener noreferrer`,className:`social-circle-btn bg-[#E4405F]`,title:`Instagram`,children:(0,d.jsx)(`svg`,{className:`w-4 sm:w-5 h-4 sm:h-5 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z`})})}),(0,d.jsx)(`a`,{href:`https://medium.com/@sughoshpdixit`,target:`_blank`,rel:`noopener noreferrer`,className:`social-circle-btn bg-[#000000]`,title:`Medium`,children:(0,d.jsx)(`svg`,{className:`w-4 sm:w-5 h-4 sm:h-5 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z`})})}),(0,d.jsx)(`a`,{href:`https://stackoverflow.com`,target:`_blank`,rel:`noopener noreferrer`,className:`social-circle-btn bg-[#F48024]`,title:`Stack Overflow`,children:(0,d.jsx)(`svg`,{className:`w-4 sm:w-5 h-4 sm:h-5 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 19.731H16.85v-2.137H6.111v2.137zm.259-4.852l10.48 2.189.451-2.07-10.478-2.187-.453 2.068zm1.359-5.056l9.659 4.66.935-1.927-9.655-4.66-.939 1.927zm3.177-4.996l8.038 7.203 1.41-1.615-8.04-7.202-1.408 1.614zm5.729-4.827l-1.745 1.233 6.077 8.603 1.743-1.233-6.075-8.603z`})})})]})}),(0,d.jsxs)(`div`,{className:`w-full flex flex-wrap items-center justify-center gap-4 sm:gap-5`,children:[(0,d.jsx)(`button`,{onClick:()=>_(`contact`),className:`hero-purple-action-btn text-sm font-bold tracking-wider px-8 py-3.5`,children:`CONTACT ME`}),(0,d.jsx)(`a`,{href:`https://drive.google.com/file/d/1Do_Aj8ruhq64P7Enq4giaJhtXpRcsHG2/view?usp=drive_link`,target:`_blank`,rel:`noopener noreferrer`,className:`hero-purple-action-btn text-sm font-bold tracking-wider px-8 py-3.5`,children:`SEE MY RESUME`})]}),(0,d.jsx)(`div`,{className:`w-full flex justify-center pt-2`,children:(0,d.jsx)(`div`,{className:`w-72 sm:w-96 h-auto`,children:(0,d.jsx)(`img`,{src:`/portfolio-assets/manOnTable.svg`,alt:`Developer Illustration`,className:`w-full h-auto object-contain mx-auto`,onError:e=>{e.target.style.display=`none`}})})})]}),(0,d.jsxs)(`section`,{id:`identity-pillars`,className:`identity-cards-wrapper border border-black/5 dark:border-white/10 shadow-sm scroll-mt-24`,children:[(0,d.jsxs)(`div`,{className:`text-center mb-8 sm:mb-10`,children:[(0,d.jsx)(`h2`,{className:`cards-title-heading text-2xl sm:text-4xl`,children:`My Four Pillars of Identity`}),(0,d.jsx)(`div`,{className:`title-underline-bar`}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm text-[#7f8c8d] dark:text-slate-400 font-medium -mt-1 tracking-wide`,children:`Click on any pillar to explore deeper`})]}),(0,d.jsx)(`div`,{className:`grid gap-6 sm:grid-cols-2 lg:grid-cols-4`,children:v.map((n,r)=>(0,d.jsxs)(`div`,{onClick:()=>t(r),className:`identity-card-item ${e===r?`active`:``}`,style:{"--card-color":n.color,"--card-color-rgb":n.colorRgb},children:[(0,d.jsxs)(`div`,{className:`card-icon-circle`,children:[(0,d.jsx)(`span`,{className:`text-3xl sm:text-4xl z-10`,children:n.icon}),(0,d.jsx)(`div`,{className:`icon-ring-pulse`})]}),(0,d.jsxs)(`div`,{className:`text-center space-y-3`,children:[(0,d.jsx)(`h3`,{className:`text-xl font-bold text-[#1a1a1a] dark:text-white leading-snug`,children:n.title}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm text-[#7f8c8d] dark:text-slate-300 leading-6 min-h-[3.6rem]`,children:n.description}),(0,d.jsxs)(`div`,{className:`flex justify-center gap-6 py-2`,children:[(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`span`,{className:`block text-2xl font-black`,style:{color:n.color},children:n.experience}),(0,d.jsx)(`span`,{className:`block text-[11px] text-[#7f8c8d] uppercase tracking-wider font-bold mt-0.5`,children:`Years`})]}),(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`span`,{className:`block text-2xl font-black`,style:{color:n.color},children:n.level}),(0,d.jsx)(`span`,{className:`block text-[11px] text-[#7f8c8d] uppercase tracking-wider font-bold mt-0.5`,children:`Level`})]})]}),(0,d.jsx)(`div`,{className:`flex flex-wrap gap-1.5 justify-center py-2`,children:n.tags.map(e=>(0,d.jsx)(`span`,{className:`px-2.5 py-1 rounded-lg text-xs font-semibold`,style:{color:n.color,backgroundColor:`rgba(${n.colorRgb}, 0.1)`,border:`none`},children:e},e))}),(0,d.jsxs)(`div`,{className:`pt-2`,children:[(0,d.jsx)(`div`,{className:`w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden shimmer-progress`,children:(0,d.jsx)(`div`,{className:`h-full rounded-full transition-all duration-700`,style:{width:`${n.progress}%`,backgroundColor:n.color}})}),(0,d.jsxs)(`span`,{className:`block text-xs font-bold mt-1.5 text-center`,style:{color:n.color},children:[n.progress,`% Mastery`]})]})]})]},n.title))}),v[e]&&(0,d.jsxs)(`div`,{className:`mt-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1a1d24] border-2 shadow-lg animate-fade-in`,style:{borderColor:v[e].color},children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-3.5 pb-4 border-b border-black/5 dark:border-white/10`,children:[(0,d.jsx)(`span`,{className:`text-3xl sm:text-4xl`,children:v[e].icon}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`h3`,{className:`text-xl sm:text-2xl font-black text-[#1a1a1a] dark:text-white`,children:[v[e].title,` Details`]}),(0,d.jsxs)(`span`,{className:`text-xs sm:text-sm font-bold`,style:{color:v[e].color},children:[v[e].level,` • `,v[e].progress,`% Mastery`]})]})]}),(0,d.jsxs)(`div`,{className:`grid gap-6 sm:grid-cols-3 pt-5 text-left`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h4`,{className:`text-xs font-bold uppercase tracking-wider text-slate-400 mb-2`,children:`Key Achievements`}),(0,d.jsx)(`ul`,{className:`space-y-2 text-xs sm:text-sm text-[#2c3e50] dark:text-slate-200`,children:v[e].achievements.map((t,n)=>(0,d.jsxs)(`li`,{className:`flex items-start gap-1.5`,children:[(0,d.jsx)(`span`,{style:{color:v[e].color},children:`▶`}),(0,d.jsx)(`span`,{children:t})]},n))})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h4`,{className:`text-xs font-bold uppercase tracking-wider text-slate-400 mb-2`,children:`Current Focus`}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm text-[#2c3e50] dark:text-slate-200 leading-relaxed`,children:v[e].currentFocus})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h4`,{className:`text-xs font-bold uppercase tracking-wider text-slate-400 mb-2`,children:`Guiding Philosophy`}),(0,d.jsxs)(`div`,{className:`p-3.5 rounded-2xl italic text-xs sm:text-sm leading-relaxed`,style:{backgroundColor:`rgba(${v[e].colorRgb}, 0.08)`,borderLeft:`4px solid ${v[e].color}`,color:v[e].color},children:[`"`,v[e].philosophy,`"`]})]})]})]})]}),(0,d.jsxs)(`section`,{id:`skills`,className:`space-y-6`,children:[(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`h2`,{className:`text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white`,children:`Technical Skills ⚡`}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d] mt-1`,children:`Tools and frameworks powering modern AI solutions`})]}),(0,d.jsx)(`div`,{className:`grid grid-cols-2 sm:grid-cols-4 gap-3`,children:[{name:`Data Science & ML`,icon:`🧠`,color:`#007ACC`,progress:95},{name:`Python & AI`,icon:`🐍`,color:`#3776AB`,progress:92},{name:`SQL & Analytics`,icon:`🗄️`,color:`#336791`,progress:90},{name:`React & Frontend`,icon:`⚛️`,color:`#61DAFB`,progress:85},{name:`Oracle Cloud`,icon:`☁️`,color:`#F80000`,progress:88},{name:`Music & Bhajans`,icon:`🎵`,color:`#FFD700`,progress:90},{name:`Football Strategy`,icon:`⚽`,color:`#228B22`,progress:85},{name:`Indian Heritage`,icon:`🕉️`,color:`#FF9933`,progress:90}].map(e=>(0,d.jsxs)(`div`,{className:`p-4 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between hover:scale-105 transition-all`,children:[(0,d.jsxs)(`div`,{className:`flex items-center gap-2 mb-2`,children:[(0,d.jsx)(`span`,{className:`text-2xl`,children:e.icon}),(0,d.jsx)(`span`,{className:`text-xs font-bold text-[#1a1a1a] dark:text-white`,children:e.name})]}),(0,d.jsx)(`div`,{className:`w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden`,children:(0,d.jsx)(`div`,{className:`h-full rounded-full`,style:{width:`${e.progress}%`,backgroundColor:e.color}})})]},e.name))})]}),(0,d.jsxs)(`section`,{id:`experience`,className:`space-y-8 scroll-mt-24`,children:[(0,d.jsxs)(`div`,{className:`text-center mb-8 sm:mb-10`,children:[(0,d.jsx)(`h2`,{className:`cards-title-heading text-2xl sm:text-4xl`,children:`Work Experience 💼`}),(0,d.jsx)(`div`,{className:`title-underline-bar`}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm text-[#7f8c8d] dark:text-slate-400 font-medium -mt-1 max-w-xl mx-auto tracking-wide`,children:`Professional track record at Oracle & Siemens across Data Science, AI & Enterprise Cloud`})]}),(0,d.jsx)(`div`,{className:`grid gap-6 sm:grid-cols-2`,children:[{role:`Data Scientist`,company:`Oracle Financial Crime & Compliance Management`,icon:`🧠`,date:`October 2024 – Present`,tag:`Current Role`,desc:`Building Machine Learning models to combat financial crimes and optimize Anti-Money Laundering efforts.`,bullets:[`Analyzing financial transaction data for fraud detection & suspicious activity patterns`,`Developing scalable predictive ML models to detect high-risk anomalies`,`Collaborating with global cross-functional teams for risk mitigation & compliance`],color:`#007ACC`,colorRgb:`0, 122, 204`,tags:[`AI / ML`,`Deep Learning`,`Fraud Analytics`,`AML`]},{role:`Senior Technical Cloud Analyst`,company:`Oracle Cloud HCM`,icon:`☁️`,date:`September 2020 – September 2024`,tag:`4 Years`,desc:`Led Data Extraction pipelines and custom analytical SQL reporting across global enterprise cloud clients.`,bullets:[`Architected custom SQL data extractors for Tier-1 enterprise cloud clients`,`Optimized database query execution across large-scale HCM datasets`,`Automated recurring client telemetry and enterprise migration workflows`],color:`#F80000`,colorRgb:`248, 0, 0`,tags:[`Oracle Cloud`,`SQL Extractor`,`Enterprise HCM`,`Data Pipelines`]},{role:`Full Stack Developer Intern`,company:`Siemens`,icon:`⚡`,date:`February 2020 – May 2020`,tag:`Internship`,desc:`Developed end-to-end industrial automation and lead-generation dashboards in 'Project Chanakya'.`,bullets:[`Engineered full stack automation dashboards for enterprise lead conversion`,`Integrated secure API workflows with backend database pipelines`],color:`#28A745`,colorRgb:`40, 167, 69`,tags:[`Full Stack`,`Spring Boot`,`React`,`Automation`]},{role:`Web Development Intern`,company:`Printalytix`,icon:`🖨️`,date:`July 2018 – September 2018`,tag:`Internship`,desc:`Designed industrial 3D manufacturing scenarios and guided teams at national Niti-Aayog innovation competition.`,bullets:[`Modeled BPMN architecture for industrial 3D manufacturing workflows`,`Operated precision FDM 3D printers and produced functional prototypes`],color:`#FF6B35`,colorRgb:`255, 107, 53`,tags:[`3D Printing`,`BPMN`,`Rapid Prototyping`,`Niti-Aayog`]}].map(e=>(0,d.jsxs)(`div`,{className:`identity-card-item flex flex-col justify-between`,style:{"--card-color":e.color,"--card-color-rgb":e.colorRgb},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`card-icon-circle`,children:[(0,d.jsx)(`span`,{className:`text-3xl sm:text-4xl z-10`,children:e.icon}),(0,d.jsx)(`div`,{className:`icon-ring-pulse`})]}),(0,d.jsxs)(`div`,{className:`text-center space-y-1.5`,children:[(0,d.jsx)(`h3`,{className:`text-lg sm:text-xl font-black text-[#1a1a1a] dark:text-white leading-snug`,children:e.role}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm font-bold tracking-wide`,style:{color:e.color},children:e.company}),(0,d.jsxs)(`div`,{className:`flex items-center justify-center gap-2 py-2 flex-wrap`,children:[(0,d.jsxs)(`span`,{className:`px-3 py-1 rounded-full text-xs font-semibold`,style:{color:e.color,backgroundColor:`rgba(${e.colorRgb}, 0.1)`},children:[`📅 `,e.date]}),(0,d.jsx)(`span`,{className:`px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300`,children:e.tag})]}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm text-[#7f8c8d] dark:text-slate-300 font-['Montserrat',sans-serif] leading-relaxed text-center font-normal px-2 pt-1`,children:e.desc}),(0,d.jsx)(`div`,{className:`flex flex-wrap gap-1.5 justify-center pt-2 pb-1`,children:e.tags.map(t=>(0,d.jsx)(`span`,{className:`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold`,style:{color:e.color,backgroundColor:`rgba(${e.colorRgb}, 0.08)`},children:t},t))})]})]}),(0,d.jsxs)(`div`,{className:`pt-4 border-t border-black/5 dark:border-white/10 mt-4 space-y-2`,children:[(0,d.jsx)(`div`,{className:`text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d] text-center`,children:`Key Contributions`}),(0,d.jsx)(`ul`,{className:`space-y-2 text-xs text-slate-600 dark:text-slate-300 font-['Montserrat',sans-serif] leading-relaxed`,children:e.bullets.map((t,n)=>(0,d.jsxs)(`li`,{className:`flex items-start gap-2`,children:[(0,d.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0`,style:{backgroundColor:e.color}}),(0,d.jsx)(`span`,{children:t})]},n))})]})]},e.role+e.company))})]}),(0,d.jsxs)(`section`,{id:`education`,className:`space-y-8 scroll-mt-24`,children:[(0,d.jsxs)(`div`,{className:`text-center mb-8 sm:mb-10`,children:[(0,d.jsx)(`h2`,{className:`cards-title-heading text-2xl sm:text-4xl`,children:`Education & Academic Honors 🎓`}),(0,d.jsx)(`div`,{className:`title-underline-bar`}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm text-[#7f8c8d] dark:text-slate-400 font-medium -mt-1 max-w-xl mx-auto tracking-wide`,children:`Master of Technology from BITS Pilani & B.E. in Information Science`})]}),(0,d.jsx)(`div`,{className:`grid gap-6 sm:grid-cols-2`,children:[{schoolName:`BITS Pilani`,degree:`Master of Technology in Data Science & Engineering`,icon:`🎓`,duration:`Sept 2021 – Sept 2023`,durationBadge:`Master's Degree`,desc:`Advanced specializations in Machine Learning, Statistical Modeling & Enterprise AI algorithms.`,bullets:[`Graduated while working full-time at Oracle with top academic performance`,`Specialized in Deep Learning, NLP & Predictive Financial Modeling`],color:`#007ACC`,colorRgb:`0, 122, 204`,tags:[`Deep Learning`,`Financial Analytics`,`AI Systems`]},{schoolName:`Bangalore Institute of Technology`,degree:`Bachelor of Engineering in Information Science`,icon:`🏛️`,duration:`Sept 2016 – April 2020`,durationBadge:`Bachelor's Degree`,desc:`Comprehensive engineering foundation in data structures, algorithms, and cloud computing.`,bullets:[`Graduated in top 10% of engineering cohort with distinction`,`Led university cultural & tech societies and published research papers`],color:`#55198B`,colorRgb:`85, 25, 139`,tags:[`Data Structures`,`Algorithms`,`Software Engineering`]}].map(e=>(0,d.jsxs)(`div`,{className:`identity-card-item flex flex-col justify-between`,style:{"--card-color":e.color,"--card-color-rgb":e.colorRgb},children:[(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`div`,{className:`card-icon-circle`,children:[(0,d.jsx)(`span`,{className:`text-3xl sm:text-4xl z-10`,children:e.icon}),(0,d.jsx)(`div`,{className:`icon-ring-pulse`})]}),(0,d.jsxs)(`div`,{className:`text-center space-y-1.5`,children:[(0,d.jsx)(`h3`,{className:`text-lg sm:text-xl font-black text-[#1a1a1a] dark:text-white leading-snug`,children:e.schoolName}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm font-bold tracking-wide`,style:{color:e.color},children:e.degree}),(0,d.jsxs)(`div`,{className:`flex items-center justify-center gap-2 py-2 flex-wrap`,children:[(0,d.jsxs)(`span`,{className:`px-3 py-1 rounded-full text-xs font-semibold`,style:{color:e.color,backgroundColor:`rgba(${e.colorRgb}, 0.1)`},children:[`📅 `,e.duration]}),(0,d.jsx)(`span`,{className:`px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300`,children:e.durationBadge})]}),(0,d.jsx)(`p`,{className:`text-xs sm:text-sm text-[#7f8c8d] dark:text-slate-300 font-['Montserrat',sans-serif] leading-relaxed text-center font-normal px-2 pt-1`,children:e.desc}),(0,d.jsx)(`div`,{className:`flex flex-wrap gap-1.5 justify-center pt-2 pb-1`,children:e.tags.map(t=>(0,d.jsx)(`span`,{className:`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold`,style:{color:e.color,backgroundColor:`rgba(${e.colorRgb}, 0.08)`},children:t},t))})]})]}),(0,d.jsxs)(`div`,{className:`pt-4 border-t border-black/5 dark:border-white/10 mt-4 space-y-2`,children:[(0,d.jsx)(`div`,{className:`text-[10px] font-bold uppercase tracking-wider text-[#7f8c8d] text-center`,children:`Academic Highlights`}),(0,d.jsx)(`ul`,{className:`space-y-2 text-xs text-slate-600 dark:text-slate-300 font-['Montserrat',sans-serif] leading-relaxed`,children:e.bullets.map((t,n)=>(0,d.jsxs)(`li`,{className:`flex items-start gap-2`,children:[(0,d.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0`,style:{backgroundColor:e.color}}),(0,d.jsx)(`span`,{children:t})]},n))})]})]},e.schoolName))})]}),(0,d.jsxs)(`section`,{id:`projects`,className:`space-y-6`,children:[(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`h2`,{className:`text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white`,children:`Featured Projects 💻`}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d] mt-1`,children:`High-impact engineering, data science & anti-fraud platforms`})]}),(0,d.jsx)(`div`,{className:`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`,children:[{name:`Oracle Financial Crime and Compliance`,category:`Financial Technology`,desc:`Comprehensive financial crime detection and compliance monitoring system using advanced analytics and machine learning to identify suspicious activities and ensure regulatory compliance.`,tech:[`Oracle Analytics`,`Python`,`Machine Learning`,`SQL`,`Oracle Cloud`],link:`https://oracle.com/`},{name:`ML4AML`,category:`Anti-Money Laundering`,desc:`Machine Learning for Anti-Money Laundering - An advanced AI-powered platform that uses deep learning algorithms to detect and prevent money laundering activities in real-time.`,tech:[`Python`,`TensorFlow`,`Deep Learning`,`Apache Spark`,`Kafka`],link:`https://github.com/SughoshDixit9`},{name:`Oracle Cloud HCM Analytics`,category:`Cloud Analytics`,desc:`Developed advanced analytics dashboard for Oracle Cloud HCM, providing insights into workforce trends and performance metrics.`,tech:[`Oracle Analytics`,`SQL`,`Python`,`Tableau`,`Oracle Cloud`],link:`https://oracle.com/`},{name:`Siemens - Project Chanakya`,category:`Industrial Automation`,desc:`Led development of a comprehensive lead generation system for industrial automation solutions, improving lead conversion by 40%.`,tech:[`Java`,`Spring Boot`,`React`,`PostgreSQL`,`Docker`],link:`https://siemens.com/`},{name:`Printalytix`,category:`3D Printing & Manufacturing`,desc:`A comprehensive 3D printing platform that revolutionizes manufacturing processes through advanced analytics and automation.`,tech:[`React`,`Node.js`,`Python`,`MongoDB`,`AWS`],link:`https://printalytix.com/`}].map(e=>(0,d.jsxs)(`div`,{className:`p-5 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#007ACC] transition-all`,children:[(0,d.jsxs)(`div`,{className:`space-y-2`,children:[(0,d.jsx)(`span`,{className:`px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase`,children:e.category}),(0,d.jsx)(`h3`,{className:`text-sm font-black text-[#1a1a1a] dark:text-white`,children:e.name}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d] dark:text-slate-400 line-clamp-3 leading-relaxed`,children:e.desc})]}),(0,d.jsxs)(`div`,{className:`pt-3 space-y-2`,children:[(0,d.jsx)(`div`,{className:`flex flex-wrap gap-1`,children:e.tech.map(e=>(0,d.jsx)(`span`,{className:`px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[9px] font-mono text-slate-600 dark:text-slate-300`,children:e},e))}),(0,d.jsxs)(`a`,{href:e.link,target:`_blank`,rel:`noopener noreferrer`,className:`btn-primary-purple text-xs py-2 px-4 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 w-full mt-2`,children:[(0,d.jsx)(`span`,{children:`View Project`}),(0,d.jsx)(s,{size:12})]})]})]},e.name))})]}),(0,d.jsxs)(`section`,{id:`achievements`,className:`space-y-6`,children:[(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`h2`,{className:`text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white`,children:`Achievements & Certifications 🏆`}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d] mt-1`,children:`Hackathons, published research, and innovation awards`})]}),(0,d.jsx)(`div`,{className:`grid gap-4 sm:grid-cols-3`,children:[{title:`Top 25 Exciting Idea at PANIIT All India Hackathon`,subtitle:`The project Alphers was an Early Age Education Monitoring Application`,link:`https://drive.google.com/file/d/1XjBXLgkwovXpdsEgIiO4LpzSofx96V0q/view`},{title:`IRJET Published Research Paper`,subtitle:`A Manuscript based on my team's Final Year Engineering Project published in International Research Journal of Engineering and Technology`,link:`https://www.irjet.net/archives/V7/i7/IRJET-V7I7285.pdf`},{title:`Rakathon - 2D to 3D View Conversion`,subtitle:`An innovation application to convert 2-D images into real-time 3-D interactive perspectives`,link:`https://drive.google.com/file/d/1b0gMXkVoNRCR4au2hVUcAXOCoWH1h_9E/view`}].map(e=>(0,d.jsxs)(`div`,{className:`p-5 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs flex flex-col justify-between hover:border-[#55198B] transition-all`,children:[(0,d.jsxs)(`div`,{className:`space-y-2`,children:[(0,d.jsx)(`div`,{className:`w-8 h-8 rounded-xl bg-purple-500/10 text-[#55198B] dark:text-purple-300 flex items-center justify-center`,children:(0,d.jsx)(i,{size:16})}),(0,d.jsx)(`h3`,{className:`text-sm font-black text-[#1a1a1a] dark:text-white`,children:e.title}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d] dark:text-slate-400 leading-relaxed`,children:e.subtitle})]}),(0,d.jsx)(`div`,{className:`pt-3`,children:(0,d.jsxs)(`a`,{href:e.link,target:`_blank`,rel:`noopener noreferrer`,className:`btn-primary-purple text-xs py-2 px-4 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 w-full`,children:[(0,d.jsx)(`span`,{children:`View Certificate`}),(0,d.jsx)(s,{size:12})]})})]},e.title))})]}),(0,d.jsxs)(`section`,{id:`blogs`,className:`space-y-6`,children:[(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`h2`,{className:`text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white`,children:`Blogs & Essays 📝`}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d] mt-1`,children:`Reflections on civilization, geopolitics, and football`})]}),(0,d.jsx)(`div`,{className:`grid gap-3 sm:grid-cols-2 lg:grid-cols-3`,children:[{title:`Gratitude for Being Born in the Ancient Civilization of Bharatavarsha`,desc:`Starting with gratitude by giving salutations to Lord Ganesha - reflections on our rich civilizational heritage and unbroken wisdom.`,url:`https://sughoshblog.vercel.app/blogs/gratitude-for-being-born-in-the-ancient-civilization-of-bharatavarsha`},{title:`Reflections from the Akhila Bharateeya Pratinidhi Sabha 2025`,desc:`My experience at the 100th year centenary of RSS as a Prabandhak - insights on disciplined leadership, nation-building, and selfless service.`,url:`https://sughoshblog.vercel.app/blogs/reflections-from-the-akhila-bharateeya-pratinidhi-sabha-2025`},{title:`A Heartfelt Ode and a Tribute to Ajjju`,desc:`Lifestory of Ajju - a touching tribute to a beloved grandfather and brave soul whose life embodied courage and righteousness.`,url:`https://sughoshblog.vercel.app/blogs/a-heartfelt-ode-and-a-tribute-to-ajjju`},{title:`India in a Shifting Global Order — Book Notes`,desc:`A comprehensive analytical breakdown of a book exploring the Indian strategic perspective in the rapidly changing multipolar geopolitical order.`,url:`https://sughoshblog.vercel.app/blogs/india-in-a-shifting-global-order-book-notes`},{title:`Five Years at Oracle: From Cloud Analyst to Data Scientist`,desc:`My journey at Oracle from being a fresh engineering graduate to architecting AI and machine learning solutions for financial crime detection.`,url:`https://sughoshblog.vercel.app/blogs/five-years-at-oracle:-from-cloud-analyst-to-data-scientist`},{title:`Do You Watch Football? Liverpool FC Devotion`,desc:`A reflection on why I chose to support Liverpool F.C., the beautiful game vs the lazy game, and the profound philosophy of 'You'll Never Walk Alone'.`,url:`https://sughoshdixit.blogspot.com/p/being-ardent-liverpool-fan-i-can-tell.html`}].map(e=>(0,d.jsxs)(`a`,{href:e.url,target:`_blank`,rel:`noopener noreferrer`,className:`p-4 rounded-2xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs hover:border-[#55198B] hover:shadow-md transition-all flex flex-col justify-between group`,children:[(0,d.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,d.jsx)(o,{size:16,className:`text-[#55198B] mb-1`}),(0,d.jsx)(`h3`,{className:`text-xs font-bold text-[#1a1a1a] dark:text-white group-hover:text-[#55198B] leading-snug`,children:e.title}),(0,d.jsx)(`p`,{className:`text-[11px] text-[#7f8c8d] dark:text-slate-400 line-clamp-3 leading-relaxed`,children:e.desc})]}),(0,d.jsx)(`span`,{className:`inline-flex items-center gap-1 text-[10px] font-bold text-[#007ACC] pt-2`,children:`Read More →`})]},e.title))})]}),(0,d.jsxs)(`section`,{id:`youtube`,className:`space-y-6`,children:[(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(`h2`,{className:`text-2xl sm:text-3xl font-black text-[#1a1a1a] dark:text-white`,children:`YouTube & AI Creative Gallery 🎨`}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d] mt-1`,children:`Data science podcasts & generative AI art experiments`})]}),(0,d.jsx)(`div`,{className:`grid gap-3 sm:grid-cols-2 lg:grid-cols-4`,children:[{id:`vX5sqN4Wl78`,title:`Sughosh Dixit - YouTube Spotlight`},{id:`rrbSLCis0QY`,title:`Data Science & AI Perspectives`},{id:`u1PtafSwvwg`,title:`TechJourney Series: Path to Data Scientist`},{id:`yXQAM2jsYgA`,title:`Cracking Data Science and AI with Sughosh Dixit`}].map(e=>(0,d.jsxs)(`div`,{className:`rounded-2xl overflow-hidden bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 shadow-xs`,children:[(0,d.jsx)(`div`,{className:`relative aspect-video w-full bg-black`,children:(0,d.jsx)(`iframe`,{title:e.title,src:`https://www.youtube.com/embed/${e.id}`,className:`absolute inset-0 w-full h-full`,allow:`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture`,allowFullScreen:!0})}),(0,d.jsx)(`div`,{className:`p-2.5`,children:(0,d.jsx)(`p`,{className:`text-[11px] font-bold text-[#1a1a1a] dark:text-white line-clamp-1`,children:e.title})})]},e.id))}),(0,d.jsx)(`div`,{className:`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2`,children:[{src:`/ai-gallery/2025myyear.jpg`,desc:`AI-generated celebration of 2025`},{src:`/ai-gallery/knee slide.jpg`,desc:`Dynamic knee slide celebration with AI`},{src:`/ai-gallery/LFC.jpg`,desc:`Liverpool FC themed artwork`},{src:`/ai-gallery/out-0 (13).webp`,desc:`Abstract digital geometry`},{src:`/ai-gallery/out-0 (25).webp`,desc:`Visual composition exploration`},{src:`/ai-gallery/out-0 (3).webp`,desc:`Digital textures & lighting`},{src:`/ai-gallery/RM-5.jpg`,desc:`Creative AI illustration RM-5`},{src:`/ai-gallery/WhatsApp Image 2025-03-04 at 11.42.56.jpeg`,desc:`Enhanced captured portrait`}].map((e,t)=>(0,d.jsxs)(`div`,{onClick:()=>a(e.src),className:`relative aspect-square rounded-2xl overflow-hidden bg-slate-200 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:scale-105 transition-all cursor-pointer group`,children:[(0,d.jsx)(`img`,{src:e.src,alt:e.desc,className:`w-full h-full object-cover`,onError:e=>{e.target.style.display=`none`}}),(0,d.jsx)(`div`,{className:`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end`,children:(0,d.jsx)(`p`,{className:`text-[10px] text-white font-medium line-clamp-2`,children:e.desc})})]},t))})]}),(0,d.jsxs)(`section`,{id:`contact`,className:`p-6 rounded-3xl bg-white dark:bg-[#1f232b] border border-black/5 dark:border-white/10 text-center space-y-4 shadow-sm`,children:[(0,d.jsx)(`h2`,{className:`text-2xl font-black text-[#1a1a1a] dark:text-white`,children:`Contact Me ☎️`}),(0,d.jsx)(`p`,{className:`text-xs text-[#7f8c8d]`,children:`Let's collaborate, build innovative AI tools & celebrate heritage!`}),(0,d.jsxs)(`div`,{className:`flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold`,children:[(0,d.jsxs)(`a`,{href:`tel:+918310080859`,className:`flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline`,children:[(0,d.jsx)(l,{size:14}),(0,d.jsx)(`span`,{children:`+91-8310080859`})]}),(0,d.jsxs)(`a`,{href:`mailto:sughoshpdixit@gmail.com`,className:`flex items-center gap-1.5 text-[#007ACC] hover:underline`,children:[(0,d.jsx)(c,{size:14}),(0,d.jsx)(`span`,{children:`sughoshpdixit@gmail.com`})]})]}),(0,d.jsxs)(`div`,{className:`flex justify-center gap-3 pt-2`,children:[(0,d.jsx)(`a`,{href:`https://github.com/SughoshDixit9`,target:`_blank`,rel:`noopener noreferrer`,className:`p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-[#333] hover:text-white transition-all`,children:(0,d.jsx)(`svg`,{className:`w-4 h-4 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z`})})}),(0,d.jsx)(`a`,{href:`https://www.linkedin.com/in/sughosh-dixit/`,target:`_blank`,rel:`noopener noreferrer`,className:`p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all`,children:(0,d.jsx)(`svg`,{className:`w-4 h-4 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z`})})}),(0,d.jsx)(`a`,{href:`https://www.instagram.com/sughoshdixit/`,target:`_blank`,rel:`noopener noreferrer`,className:`p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-[#e4405f] hover:bg-[#e4405f] hover:text-white transition-all`,children:(0,d.jsx)(`svg`,{className:`w-4 h-4 fill-current`,viewBox:`0 0 24 24`,children:(0,d.jsx)(`path`,{d:`M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z`})})})]}),(0,d.jsx)(`p`,{className:`text-[10px] text-[#7f8c8d] pt-2`,children:`Made with ❤️ by Sughosh Dixit • All Rights Reserved`})]})]}),(0,d.jsx)(`button`,{onClick:g,className:`football-scroll-btn ${f?`visible`:``} ${m?`animating`:``}`,title:`Scroll to Top ⚽`,children:(0,d.jsx)(`div`,{className:`football-ball-icon`,children:(0,d.jsx)(`span`,{children:`⚽`})})}),r&&(0,d.jsx)(`div`,{className:`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4`,onClick:()=>a(null),children:(0,d.jsxs)(`div`,{className:`relative max-w-lg max-h-[85vh] p-2 bg-white dark:bg-[#1f232b] rounded-2xl`,children:[(0,d.jsx)(`button`,{onClick:()=>a(null),className:`absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white`,children:(0,d.jsx)(n,{size:16})}),(0,d.jsx)(`img`,{src:r,alt:`Preview`,className:`max-h-[75vh] w-auto rounded-xl object-contain mx-auto`})]})})]})};export{f as SughoshDixitPortfolioTab};