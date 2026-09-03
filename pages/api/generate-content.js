// pages/api/generate-content.js
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    contentType, // 'blog_post', 'social_media', 'ad_copy', 'landing_page'
    platform, // 'instagram', 'facebook', 'linkedin', 'twitter', 'blog'
    competitorName,
    competitorKeywords,
    competitorContent,
    productName
  } = req.body;

  if (!contentType || !platform) {
    return res.status(400).json({ error: 'contentType and platform are required' });
  }

  try {
    // Create prompt based on content type
    const prompt = buildPrompt(
      contentType,
      platform,
      competitorName,
      competitorKeywords,
      competitorContent,
      productName
    );

    // Generate content with Claude
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const generatedContent = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    return res.status(200).json({
      success: true,
      data: {
        contentType,
        platform,
        content: generatedContent,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Content generation error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
}

function buildPrompt(contentType, platform, competitorName, keywords, content, productName) {
  const keywordStr = keywords ? keywords.map(k => k.word).join(', ') : '';
  
  const prompts = {
    blog_post: `Write a SEO-optimized blog post (500-800 words) about ${productName}. 
      Analyze this competitor content from ${competitorName}:
      "${content}"
      
      Use these keywords naturally: ${keywordStr}
      
      Make it better, more informative, and unique. Include:
      - Compelling headline
      - Introduction
      - 3-4 main sections with subheadings
      - Conclusion
      - CTA`,

    social_media: `Create engaging ${platform} posts (3 variations) for ${productName}.
      Competitor is doing: "${content}"
      Target keywords: ${keywordStr}
      
      Make them catchy, shareable, and include relevant hashtags for ${platform}.
      Keep tone casual and engaging.`,

    ad_copy: `Write 5 variations of compelling ad copy for ${productName} on ${platform}.
      Competitor's approach: "${content}"
      Key selling points keywords: ${keywordStr}
      
      Each variation should be:
      - Attention-grabbing
      - Include CTA (Click, Learn More, Buy)
      - Character limits respected for ${platform}`,

    landing_page: `Create a landing page copy for ${productName}.
      Analyze competitor (${competitorName}): "${content}"
      Keywords: ${keywordStr}
      
      Structure:
      - Headline (benefits-focused)
      - Subheadline
      - Hero section copy
      - 3 benefit sections
      - Social proof section
      - CTA button text
      - Footer copy`
  };

  return prompts[contentType] || prompts.blog_post;
}
