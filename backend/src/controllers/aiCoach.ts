import { Response } from 'express'
import { prisma } from '../lib/db'
import type { AuthenticatedRequest } from '../middlewares/auth'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

const SYSTEM_PROMPT = `You are Alex, an expert AI career mentor at Edworld Co. You help students and young professionals with:

- Resume optimization and ATS scoring
- Interview preparation (behavioral and technical)
- Career roadmap planning and skill development
- Portfolio and project guidance
- Job search strategies and networking
- Salary negotiation and professional growth
- Technical learning paths (programming, AI/ML, web dev, etc.)

Personality: Warm, encouraging, and practical. Give actionable advice, not vague platitudes. Use the student's name and reference their specific skills/background when relevant.

Rules:
- Keep responses concise (2-4 paragraphs max) unless the user asks for detail
- Be conversational but professional
- If asked about something outside career/tech, politely redirect to career topics
- Never fabricate specific company policies or salary numbers — use ranges or say "typically"
- Format with simple paragraphs, no markdown headers`;

function buildContext(profile: any): string {
  if (!profile) return '';
  const parts: string[] = [];
  if (profile.user?.fullName) parts.push(`Name: ${profile.user.fullName}`);
  if (profile.collegeName) parts.push(`College: ${profile.collegeName}`);
  if (profile.degree && profile.branch) parts.push(`Degree: ${profile.degree} in ${profile.branch}`);
  if (profile.graduationYear) parts.push(`Graduation: ${profile.graduationYear}`);
  if (profile.headline) parts.push(`Headline: ${profile.headline}`);
  if (profile.bio) parts.push(`Bio: ${profile.bio}`);
  const skills = profile.skills?.map((s: any) => s.name).join(', ');
  if (skills) parts.push(`Skills: ${skills}`);
  const interests = profile.interests ? JSON.parse(profile.interests) : [];
  if (interests.length) parts.push(`Interests: ${interests.join(', ')}`);
  const goals = profile.goals ? JSON.parse(profile.goals) : [];
  if (goals.length) parts.push(`Goals: ${goals.join(', ')}`);
  const projects = profile.projects?.map((p: any) => p.title).join(', ');
  if (projects) parts.push(`Projects: ${projects}`);
  const exp = profile.experience?.map((e: any) => `${e.role} at ${e.company}`).join(', ');
  if (exp) parts.push(`Experience: ${exp}`);
  return parts.length ? `\n\nStudent profile:\n${parts.join('\n')}` : '';
}

async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://edworld.co',
      'X-Title': 'Edworld AI Career Coach'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages,
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue generating a response. Please try again.';
}

function getSmartFallback(message: string, firstName: string, context: string): string {
  const text = message.toLowerCase();

  if (text.match(/\b(hi|hello|hey|good morning|good evening|good afternoon)\b/)) {
    return `Hey ${firstName}! Great to see you. I'm Alex, your career mentor. Whether you need help with your resume, interview prep, career roadmaps, or just general advice — I'm here. What would you like to work on today?`;
  }

  if (text.match(/\b(resume|cv|resume scanner|ats)\b/)) {
    return `${firstName}, here's how to make your resume ATS-friendly:\n\n1. Use standard section headings (Experience, Education, Skills)\n2. Include keywords from the job description naturally\n3. Quantify achievements — "Improved load time by 40%" beats "Improved performance"\n4. Keep it to 1-2 pages with clean formatting\n5. Save as PDF unless otherwise specified\n\nYou can upload your resume in the ATS Resume section for a detailed score and suggestions. Want me to review specific sections?`;
  }

  if (text.match(/\b(interview|mock|behavioral|technical interview)\b/)) {
    return `Let's get you interview-ready, ${firstName}! Here's a solid framework:\n\nFor behavioral questions, use the STAR method:\n- Situation: Set the scene\n- Task: What was your responsibility\n- Action: What specifically YOU did\n- Result: The measurable outcome\n\nFor technical questions, think out loud — explain your approach before coding.\n\nWant to practice? Give me a question you're worried about and I'll help you craft a strong answer.`;
  }

  if (text.match(/\b(roadmap|learn|study|path|plan|syllabus)\b/)) {
    return `Here's a practical 4-week learning roadmap, ${firstName}:\n\nWeek 1-2: Strengthen fundamentals — pick one core area (DSA, system design, or a framework) and do daily practice problems.\n\nWeek 3: Build a portfolio project that demonstrates those skills. Something real, not a tutorial clone.\n\nWeek 4: Mock interviews and resume polish. Apply to 5+ positions.\n\nWant me to customize this based on your specific goals and current skills?`;
  }

  if (text.match(/\b(portfolio|project|github| showcase)\b/)) {
    return `Great portfolio tips, ${firstName}:\n\n1. Lead with your best 3-4 projects — quality over quantity\n2. Each project should have: what it does, tech stack, your role, and a live demo link\n3. Write clean README files with screenshots\n4. Include at least one project that shows full-stack capability\n5. Contribute to open source — it shows collaboration skills\n\nYou can build and configure your portfolio directly in the Edworld dashboard. Want help structuring a specific project?`;
  }

  if (text.match(/\b(salary|negotiate|negotiation|pay|compensation)\b/)) {
    return `Salary negotiation tips, ${firstName}:\n\n1. Research market rates on Glassdoor/Levels.fyi for your role and location\n2. Let them make the first offer if possible\n3. Always negotiate — even 5-10% adds up over years\n4. Consider the full package: equity, benefits, PTO, learning budget\n5. Practice your pitch: "Based on my research and experience, I'm targeting $X-$Y"\n\nRemember: the worst they can say is no, and most companies expect negotiation.`;
  }

  if (text.match(/\b(job|apply|internship|opportunity|career)\b/)) {
    return `${firstName}, here's an effective job search strategy:\n\n1. Apply to 5-10 quality applications per week, not 50 random ones\n2. Tailor your resume for each application\n3. Network on LinkedIn — comment on posts, connect with recruiters\n4. Use the Edworld Opportunities Hub for curated listings matched to your skills\n5. Follow up 1 week after applying\n\nCheck the Jobs & Internships section in your dashboard for AI-matched opportunities. Want tips on any specific step?`;
  }

  if (text.match(/\b(thank|thanks|appreciate)\b/)) {
    return `You're welcome, ${firstName}! I'm always here when you need guidance. Don't hesitate to come back anytime — whether it's for quick advice or a deep career planning session. Keep building! 🚀`;
  }

  if (text.match(/\b(help|what can you|what do you|how do you)\b/)) {
    return `I can help you with:\n\n🎯 Resume & ATS optimization\n🗣️ Mock interview practice (behavioral + technical)\n🗺️ Personalized learning roadmaps\n💼 Job search strategies\n🤝 Networking advice\n📊 Career planning and goal setting\n💰 Salary negotiation tips\n🏗️ Portfolio and project guidance\n\nJust ask me anything career-related and I'll give you practical, actionable advice. What would you like to start with?`;
  }

  if (context) {
    return `That's a great question, ${firstName}. ${context}\n\nCould you tell me more about what specifically you'd like help with? For example, are you looking for:\n- Resume advice\n- Interview preparation\n- A learning roadmap\n- Job search strategy\n- Or something else?`;
  }

  return `Thanks for your message, ${firstName}! I'm here to help with anything career-related — whether that's resume tips, interview prep, learning roadmaps, job search strategies, or portfolio advice.\n\nWhat specific area would you like to focus on? The more details you share about your goals, the better I can help.`;
}

export const sendChatMessage = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const { chatId, message } = req.body

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message content is required' })
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: true,
        projects: true,
        experience: true,
        user: { select: { fullName: true } }
      }
    })

    const firstName = profile?.user?.fullName?.split(' ')[0] || 'there'
    const profileContext = buildContext(profile)

    let reply = ''

    if (OPENROUTER_API_KEY) {
      // Build conversation history for OpenAI
      const chatHistory: { role: string; content: string }[] = [];

      if (chatId) {
        const existingChat = await prisma.aIChat.findUnique({ where: { id: chatId } });
        if (existingChat && existingChat.userId === req.user.id) {
          const messages = JSON.parse(existingChat.messages);
          // Take last 10 messages for context window
          const recent = messages.slice(-10);
          for (const m of recent) {
            chatHistory.push({ role: m.role, content: m.content });
          }
        }
      }

      const systemMessage = SYSTEM_PROMPT + profileContext;
      const messages = [
        { role: 'system', content: systemMessage },
        ...chatHistory,
        { role: 'user', content: message }
      ];

      try {
        reply = await callOpenRouter(messages);
      } catch (aiError: any) {
        console.error('OpenRouter call failed, using fallback:', aiError.message);
        reply = getSmartFallback(message, firstName, '');
      }
    } else {
      reply = getSmartFallback(message, firstName, profileContext);
    }

    const savedChat = await prisma.$transaction(async (tx) => {
      let chat
      if (chatId) {
        chat = await tx.aIChat.findUnique({ where: { id: chatId } })
        if (chat && chat.userId !== req.user!.id) {
          throw new Error('UNAUTHORIZED_CHAT')
        }
      }

      const existingMessages = chat ? JSON.parse(chat.messages) : []
      const updatedMessages = [
        ...existingMessages,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
      ]

      if (chat) {
        return tx.aIChat.update({
          where: { id: chatId },
          data: {
            messages: JSON.stringify(updatedMessages),
            title: existingMessages.length === 0
              ? (message.length > 25 ? message.substring(0, 25) + '...' : message)
              : chat.title,
            updatedAt: new Date()
          }
        })
      } else {
        return tx.aIChat.create({
          data: {
            userId: req.user!.id,
            title: message.length > 25 ? message.substring(0, 25) + '...' : message,
            messages: JSON.stringify(updatedMessages)
          }
        })
      }
    })

    res.json({
      chatId: savedChat.id,
      reply,
      messages: JSON.parse(savedChat.messages)
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    if (error.message === 'UNAUTHORIZED_CHAT') {
      return res.status(403).json({ error: 'Unauthorized access to chat session' })
    }
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

export const getChatSessions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const list = await prisma.aIChat.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    })

    const parsedList = list.map(c => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      messages: JSON.parse(c.messages)
    }))

    res.json(parsedList)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load chat history.' })
  }
}

export const deleteChatSession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  const id = req.params.id as string

  try {
    const chat = await prisma.aIChat.findUnique({ where: { id } })
    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' })
    }
    if (chat.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await prisma.aIChat.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat session.' })
  }
}
