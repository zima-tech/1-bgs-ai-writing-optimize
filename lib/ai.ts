type GenerateDraftInput = {
  title: string;
  type: string;
  keywords: string;
  requirements: string;
  tone: string;
  wordCount: number;
  templateName?: string | null;
};

type OutlineInput = {
  topic: string;
  requirements: string;
};

type ProofreadInput = {
  title: string;
  content: string;
};

export type ProofreadIssuePayload = {
  issueType: string;
  severity: string;
  originalText: string;
  suggestion: string;
  reason: string;
  positionStart: number;
  positionEnd: number;
};

const baseUrl = process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
const model = process.env.GLM_MODEL || 'GLM-4.7-Flash';

async function callGlm(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GLM_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return json?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function generateDraft(input: GenerateDraftInput) {
  const prompt = [
    `标题：${input.title || '未命名材料'}`,
    `文稿类型：${input.type}`,
    `模板：${input.templateName || '通用模板'}`,
    `关键词：${input.keywords}`,
    `写作要求：${input.requirements}`,
    `行文风格：${input.tone}`,
    `目标字数：${input.wordCount}`
  ].join('\n');

  const remoteContent = await callGlm(
    '你是一名国企办公室写作助手，请输出结构完整、措辞规范、可直接编辑的正式文稿。',
    prompt
  );

  return {
    content:
      remoteContent ||
      `关于${input.title || input.keywords || '重点工作'}的${input.type}\n\n一、总体情况\n围绕${input.keywords || '年度重点任务'}，结合${input.requirements || '当前工作实际'}，现形成如下初稿。\n\n二、主要做法\n1. 加强统筹协调，明确任务分工。\n2. 聚焦重点事项，提升执行质效。\n3. 强化过程跟踪，确保结果可追溯。\n\n三、下一步安排\n后续将按照${input.tone}的表达要求，对材料内容继续补充完善，并结合实际数据进一步细化支撑内容。`,
    source: remoteContent ? 'glm' : 'fallback'
  };
}

export async function generateOutline(input: OutlineInput) {
  const remoteContent = await callGlm(
    '你是一名办公室材料撰写助手，请输出清晰的三级中文大纲。',
    `主题：${input.topic}\n要求：${input.requirements}`
  );

  return {
    outline:
      remoteContent ||
      `一、工作背景\n（一）任务来源\n（二）总体目标\n\n二、重点工作安排\n（一）阶段任务拆解\n1. 前期准备\n2. 推进落实\n（二）风险与保障\n\n三、后续工作建议\n（一）持续优化方向\n（二）长效机制安排`,
    source: remoteContent ? 'glm' : 'fallback'
  };
}

export async function optimizeWriting(content: string, tone: string) {
  const remoteContent = await callGlm(
    '你是一名文字优化助手，请对输入文稿进行正式、准确、简洁的表达优化。',
    `请按照“${tone}”风格优化以下材料，并保留原业务含义：\n${content}`
  );

  return {
    content: remoteContent || `${content}\n\n【优化建议】建议进一步统一行文口径、压缩重复表述、突出重点事项与执行结果。`,
    source: remoteContent ? 'glm' : 'fallback'
  };
}

export async function proofreadContent(input: ProofreadInput) {
  const issues: ProofreadIssuePayload[] = [];
  const content = input.content || '';

  const typoIndex = content.indexOf('做为');
  if (typoIndex >= 0) {
    issues.push({
      issueType: '错别字校对',
      severity: '高',
      originalText: '做为',
      suggestion: '作为',
      reason: '“做为”是常见错误写法，正式公文应使用“作为”。',
      positionStart: typoIndex,
      positionEnd: typoIndex + 2
    });
  }

  const grammarIndex = content.indexOf('通过学习考察');
  if (grammarIndex >= 0) {
    issues.push({
      issueType: '语法校对',
      severity: '中',
      originalText: '通过学习考察',
      suggestion: '经过学习考察',
      reason: '该语境下“经过”更符合书面表达。',
      positionStart: grammarIndex,
      positionEnd: grammarIndex + 6
    });
  }

  if (!content.includes('一、')) {
    issues.push({
      issueType: '格式校对',
      severity: '中',
      originalText: '未设置一级标题',
      suggestion: '建议增加“一、二、三”结构化标题',
      reason: '正式材料缺少层级标题，不利于阅读和审签。',
      positionStart: 0,
      positionEnd: 0
    });
  }

  if (content.includes('绝密')) {
    const sensitiveIndex = content.indexOf('绝密');
    issues.push({
      issueType: '敏感词检测',
      severity: '高',
      originalText: '绝密',
      suggestion: '保密',
      reason: '需结合材料性质审慎使用敏感级别措辞。',
      positionStart: sensitiveIndex,
      positionEnd: sensitiveIndex + 2
    });
  }

  const remoteSummary = await callGlm(
    '你是一名国企材料校对助手，请用简明中文概括校对重点。',
    `标题：${input.title}\n内容：${content}`
  );

  return {
    reviewedContent: content.replaceAll('做为', '作为'),
    summary:
      remoteSummary ||
      `本次校对共识别 ${issues.length} 处重点问题，主要集中在错别字、语法表达和材料结构规范性，建议逐项修订后再进入定稿环节。`,
    issues,
    source: remoteSummary ? 'glm' : 'fallback'
  };
}
