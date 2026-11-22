import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SKL_DETAIL, SKL_DIFF, SKL_EDIT, SKL_GH, SKL_GLOSS, SKL_SKILLS, SKL_SOURCES, SKL_UPDATES } from '@spekin/sample';
import {
  SkillsLibraryView,
  SkillDetailView,
  SkillEditView,
  SkillGithubDrawer,
  SkillUpdatesView,
  SkillGlossaryView,
  SkillSlashMenu,
  stepSlashPicker,
} from './SkillsViews';

const noop = () => {};

describe('S40 Skills library (IMP-23)', () => {
  it('renders the library state with all 9 skills, sources, starter templates and project switches', () => {
    const html = renderToStaticMarkup(
      <SkillsLibraryView
        skills={SKL_SKILLS}
        stageFilter="All stages"
        sourceFilter={null}
        statusFilter={null}
        query=""
        enabledMap={Object.fromEntries(SKL_SKILLS.map((s) => [s[0], s[7]]))}
        onStageFilter={noop}
        onSourceFilter={noop}
        onStatusFilter={noop}
        onQueryChange={noop}
        onToggleSkill={noop}
        onOpenSkill={noop}
        onOpenUpdates={noop}
        onOpenGithub={noop}
        onNewSkill={noop}
      />,
    );
    expect(html).toContain('Start here: free templates');
    for (const s of SKL_SKILLS) expect(html).toContain(s[1]);
    for (const src of SKL_SOURCES) expect(html).toContain(src.name);
    expect(html.match(/role="switch"/g)?.length).toBe(SKL_SKILLS.length);
  });

  it('renders the detail state with attribution, limits, update policy and Share later control', () => {
    const html = renderToStaticMarkup(
      <SkillDetailView
        detail={SKL_DETAIL}
        policy="Auto"
        enabled
        onBack={noop}
        onCopyEdit={noop}
        onUseInChat={noop}
        onOpenGithub={noop}
        onPolicyChange={noop}
        onToggleEnabled={noop}
      />,
    );
    expect(html).toContain(SKL_DETAIL.title);
    expect(html).toContain(SKL_DETAIL.path);
    expect(html).toContain('Copyright (c) 2026 Matt Pocock');
    expect(html).toContain('Copy and edit');
    expect(html).toContain('Use in chat');
    expect(html.match(/data-later=/g)?.length).toBe(1);
  });

  it('renders the edit state with plain fields, checks and dry-run sample results', () => {
    const html = renderToStaticMarkup(
      <SkillEditView
        edit={SKL_EDIT}
        title={SKL_EDIT.title}
        desc={SKL_EDIT.desc}
        stages={SKL_EDIT.stages}
        onTitleChange={noop}
        onDescChange={noop}
        onToggleStage={noop}
        onDiscard={noop}
        onSave={noop}
        onTryAgain={noop}
      />,
    );
    expect(html).toContain(SKL_EDIT.title);
    expect(html).toContain('Save as version 2');
    expect(html).toContain('Try on the sample');
    for (const [, name] of SKL_EDIT.dry) expect(html).toContain(name);
  });

  it('renders the GitHub import drawer with repo scan, licence, policy and safety checks', () => {
    const html = renderToStaticMarkup(
      <SkillGithubDrawer
        gh={SKL_GH}
        url={SKL_GH.url}
        selected={{ 'grill-me': true, 'to-spec': true, 'to-tickets': true, 'domain-modeling': true, tdd: true, 'code-review': true }}
        policy="Auto-update"
        onUrlChange={noop}
        onScan={noop}
        onTogglePick={noop}
        onPolicyChange={noop}
        onClose={noop}
        onAdd={noop}
      />,
    );
    expect(html).toContain('Add skills from GitHub');
    expect(html).toContain(SKL_GH.licence);
    expect(html).toContain('Add 6 skills');
  });

  it('renders the updates history and held diff with roll back and review actions', () => {
    const html = renderToStaticMarkup(
      <SkillUpdatesView
        updates={SKL_UPDATES}
        diff={SKL_DIFF}
        onBack={noop}
        onCheckNow={noop}
        onRollback={noop}
        onKeepCurrent={noop}
        onApplyWithoutTool={noop}
        onApply={noop}
      />,
    );
    expect(html).toContain('Waiting for you: Split into tickets');
    expect(html).toContain('Roll back');
    expect(html).toContain('Apply without the tool');
    for (const [, line] of SKL_DIFF) expect(html).toContain(line);
  });

  it('renders the glossary view and keyboard-first / skill picker', () => {
    const gloss = renderToStaticMarkup(<SkillGlossaryView rows={SKL_GLOSS} onOpenReview={noop} />);
    expect(gloss).toContain('GLOSSARY.md');
    for (const [term] of SKL_GLOSS) expect(gloss).toContain(term);

    const specSkills = SKL_SKILLS.filter((s) => s[3].includes('Specification') && s[7]).slice(0, 4);
    const menu = renderToStaticMarkup(
      <SkillSlashMenu skills={specSkills} activeIndex={0} onPick={noop} onBrowseAll={noop} />,
    );
    expect(menu).toContain('role="listbox"');
    expect(menu).toContain('/grill');
    expect(menu).toContain('Browse all skills');

    // Keyboard navigation: ArrowDown wraps, ArrowUp wraps, Enter picks, Escape closes and keeps text
    expect(stepSlashPicker({ key: 'ArrowDown', index: 0, count: 4 })).toEqual({ type: 'move', index: 1 });
    expect(stepSlashPicker({ key: 'ArrowUp', index: 0, count: 4 })).toEqual({ type: 'move', index: 3 });
    expect(stepSlashPicker({ key: 'Enter', index: 1, count: 4 })).toEqual({ type: 'pick', index: 1 });
    expect(stepSlashPicker({ key: 'Escape', index: 1, count: 4 })).toEqual({ type: 'close' });
  });
});
