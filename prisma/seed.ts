import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.conversationMessage.deleteMany();
  await prisma.proofreadIssue.deleteMany();
  await prisma.proofreadTask.deleteMany();
  await prisma.writingDocument.deleteMany();
  await prisma.writingTemplate.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      department: '办公室',
      role: '管理员',
      status: '启用'
    }
  });

  await prisma.systemSetting.createMany({
    data: [
      {
        groupName: '写作策略',
        key: 'writing.defaultTone',
        value: '正式稳健',
        type: 'string',
        description: '默认文稿风格'
      },
      {
        groupName: '校对策略',
        key: 'proofread.defaultRiskRule',
        value: '敏感词优先高亮',
        type: 'string',
        description: '校对风险策略'
      },
      {
        groupName: 'AI 服务',
        key: 'ai.localFallback',
        value: '启用',
        type: 'string',
        description: '当外部模型不可用时启用本地初稿与校对分析'
      }
    ]
  });

  const templates = await Promise.all(
    [
      ['report', '工作报告', '适用于阶段总结、年度汇报、专项报告'],
      ['minutes', '会议纪要', '适用于专题会议、办公会议纪要整理'],
      ['notice', '通知', '适用于内部通知、工作提示、事项提醒'],
      ['letter', '函', '适用于往来函件、沟通函'],
      ['speech', '讲话稿', '适用于领导讲话、交流发言'],
      ['briefing', '简报', '适用于工作简报、动态快报']
    ].map(([code, name, description], index) =>
      prisma.writingTemplate.create({
        data: {
          code,
          name,
          type: code,
          description,
          prompt: `${name}专业模板`,
          seedSample: `${name}示例内容`,
          order: index + 1
        }
      })
    )
  );

  const seededDocuments = Array.from({ length: 24 }).map((_, index) => ({
    title: `办公室重点工作材料第 ${index + 1} 号`,
    type: index % 2 === 0 ? '工作报告' : '通知',
    status: index % 3 === 0 ? '已定稿' : '草稿',
    tone: index % 2 === 0 ? '正式稳健' : '简洁明晰',
    keywords: '重点任务,督办落实,流程优化',
    summary: '围绕重点任务推进情况形成材料初稿，并纳入统一写稿台账。',
    outline: '一、总体情况\n二、推进举措\n三、下一步安排',
    content: `第 ${index + 1} 份材料示例内容。围绕重点任务推进、督办落实、会议协调等办公室核心职责，形成统一材料底稿。`,
    source: 'seed',
    templateId: templates[index % templates.length].id
  }));

  const documents = await Promise.all(
    seededDocuments.map((data) => prisma.writingDocument.create({ data }))
  );

  for (const document of documents.slice(0, 10)) {
    await prisma.conversationMessage.createMany({
      data: [
        {
          documentId: document.id,
          role: 'assistant',
          stage: '任务理解',
          content: `已识别《${document.title}》的写作任务，优先围绕办公室重点工作提炼结构。`
        },
        {
          documentId: document.id,
          role: 'assistant',
          stage: '结果生成',
          content: '已形成初稿，建议补充数据支撑和节点安排后进入审稿流程。'
        }
      ]
    });
  }

  for (let index = 0; index < 12; index += 1) {
    const task = await prisma.proofreadTask.create({
      data: {
        title: `综合材料校对任务 ${index + 1}`,
        sourceType: index % 2 === 0 ? '手动录入' : '上传文稿',
        status: index % 3 === 0 ? '已复核' : '待处理',
        riskLevel: index % 2 === 0 ? '中' : '高',
        originalContent: `综合材料示例内容 ${index + 1}，请于本周完成总结报送。做为部门年度重点事项，需要形成专题报告。`,
        reviewedContent: `综合材料示例内容 ${index + 1}，请于本周完成总结报送。作为部门年度重点事项，需要形成专题报告。`,
        summary: '识别出错别字、表述不规范和结构层级不足等问题。',
        source: 'seed'
      }
    });

    await prisma.proofreadIssue.createMany({
      data: [
        {
          taskId: task.id,
          issueType: '错别字校对',
          severity: '高',
          originalText: '做为',
          suggestion: '作为',
          reason: '正式材料应使用“作为”。',
          positionStart: 28,
          positionEnd: 30
        },
        {
          taskId: task.id,
          issueType: '格式校对',
          severity: '中',
          originalText: '未设置标题层级',
          suggestion: '建议补充一级、二级标题',
          reason: '便于审签和归档。',
          positionStart: 0,
          positionEnd: 0
        }
      ]
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        module: '登录',
        action: '登录成功',
        objectType: '用户',
        operator: 'admin',
        result: '成功',
        summary: '管理员登录智能写稿优化和校对系统。'
      },
      {
        module: '智能写作',
        action: '生成初稿',
        objectType: '文稿',
        operator: 'admin',
        result: '成功',
        summary: '完成工作报告初稿生成并写入文稿台账。'
      },
      {
        module: '文字校对',
        action: '保存校对结果',
        objectType: '校对任务',
        operator: 'admin',
        result: '成功',
        summary: '完成校对结果保存并形成审计留痕。'
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
