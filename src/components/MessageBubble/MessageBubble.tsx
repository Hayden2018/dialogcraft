import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CustomCodeBlock from 'components/CustomCodeBlock/CustomCodeBlock';
import { useMessageEditActions, useMessageSegmentMemo } from './MessageBubble.hook';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import React, { RefObject, useEffect, useState } from 'react';

const RightAligner = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'right',
  margin: '16px 0px',
}));

const LeftAligner = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'left',
  margin: '16px 0px',
}));

const BotMessageContainer = styled('div')(({ theme: { palette, breakpoints } }) => ({
  width: 'fit-content',
  maxWidth: 'calc(100% - 100px)',
  borderRadius: 10,
  background: palette.grey[palette.mode === 'dark' ? 800 : 200],
  padding: '9px 12px',
  margin: '0px 16px',
  color: palette.mode === 'dark' ? '#ffffff' : '#000000',
  overflow: 'hidden',
  '& a': {
    color: palette.primary.main,
  },
  [breakpoints.down(1080)]: {
    maxWidth: 'calc(100% - 30px)',
  },
}));

const UserMessageContainer = styled('div')(({ theme: { breakpoints } }) => ({
  textAlign: 'left',
  width: 'fit-content',
  maxWidth: 'calc(100% - 100px)',
  borderRadius: 10,
  padding: '8px 12px',
  margin: '0px 12px',
  color: '#121212',
  background: '#ACDDFF',
  overflow: 'hidden',
  '& a': {
    color: '#036092',
  },
  [breakpoints.down(520)]: {
    maxWidth: 'calc(100% - 60px)',
  },
}));

const MarginRemoveContainer = styled('div')(({ theme: { palette } }) => ({
  '& table, th, td': {
    border: `1px solid ${palette.mode === 'dark' ? 'white' : 'black'}`,
    borderCollapse: 'collapse',
    borderSpacing: '0px',
  },
  '& th, td': {
    padding: '4px 6px',
  },
  '& > :first-child': {
    marginTop: 0,
  },
  '& > :last-child': {
    marginBottom: 0,
  },
}));

const ReasoningContainer = styled('div')(({ theme: { palette } }) => ({
  marginBottom: 10,
  minWidth: 260,
  borderRadius: 8,
  border: `1px solid ${palette.mode === 'dark' ? palette.grey[700] : palette.grey[400]}`,
  background: palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
  overflow: 'hidden',
}));

const ReasoningToggle = styled('button')(({ theme: { palette } }) => ({
  width: '100%',
  border: 'none',
  background: 'transparent',
  color: palette.mode === 'dark' ? palette.grey[300] : palette.grey[800],
  cursor: 'pointer',
  textAlign: 'left',
  padding: '8px 10px',
  fontSize: 13,
  fontWeight: 600,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ReasoningBody = styled('pre')(({ theme: { palette } }) => ({
  margin: 0,
  padding: '0 10px 10px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'inherit',
  fontSize: 13,
  lineHeight: 1.45,
  color: palette.mode === 'dark' ? palette.grey[400] : palette.grey[700],
  maxHeight: 280,
  overflowY: 'auto',
}));

const EditButtonContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  marginTop: 10,
  height: 25,
  gap: 8,
}));

const EditButton = styled(Button)(({ theme }) => ({
  padding: '0px 18px',
  height: 25,
  fontSize: 12,
}));

function ReasoningTrace({ reasoning, generating }: { reasoning: string; generating: boolean }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Expand while streaming reasoning before the final answer arrives.
    if (generating) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [generating]);

  if (!reasoning) return null;

  return (
    <ReasoningContainer>
      <ReasoningToggle type="button" onClick={() => setExpanded((value) => !value)}>
        <span>{generating ? 'Thinking...' : 'Reasoning'}</span>
        <span>{expanded ? 'Hide' : 'Show'}</span>
      </ReasoningToggle>
      {expanded && <ReasoningBody>{reasoning}</ReasoningBody>}
    </ReasoningContainer>
  );
}

const MessageBubble = React.memo(
  ({
    chatId,
    msgId,
    msgContent,
    reasoning,
    role,
    editMode,
    generating,
    forwardRef,
  }: {
    chatId: string;
    msgId: string;
    msgContent: string;
    reasoning?: string;
    role: string;
    editMode: boolean;
    generating: boolean;
    forwardRef: RefObject<HTMLDivElement> | null;
  }) => {
    // restoreMessage is null if message is unedited
    const { deleteMessage, regenerateMessage, editMessage, restoreMessage } = useMessageEditActions(
      chatId,
      msgId
    );
    const displayContent = msgContent || (reasoning ? '' : '...');
    const messageSegments = useMessageSegmentMemo(displayContent || '...');

    if (role === 'user')
      return (
        <RightAligner ref={forwardRef}>
          <UserMessageContainer>
            <MarginRemoveContainer>
              {messageSegments.map(({ type, content }: { type: string; content: string }, index) => {
                if (type === 'text')
                  return <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} key={index} />;
                return <CustomCodeBlock language={type} code={content} key={index} />;
              })}
            </MarginRemoveContainer>
            {editMode && (
              <EditButtonContainer>
                {restoreMessage && (
                  <EditButton color="info" variant="contained" onClick={restoreMessage}>
                    Restore
                  </EditButton>
                )}
                <EditButton color="warning" variant="contained" onClick={editMessage}>
                  Edit
                </EditButton>
                <EditButton color="error" variant="contained" onClick={deleteMessage}>
                  Delete
                </EditButton>
              </EditButtonContainer>
            )}
          </UserMessageContainer>
        </RightAligner>
      );
    return (
      <LeftAligner ref={forwardRef}>
        <BotMessageContainer id={msgId}>
          <ReasoningTrace reasoning={reasoning || ''} generating={generating} />
          {(!!displayContent || !reasoning) && (
            <MarginRemoveContainer>
              {messageSegments.map(({ type, content }: { type: string; content: string }, index) => {
                if (type === 'text')
                  return <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} key={index} />;
                return <CustomCodeBlock language={type} code={content} key={index} />;
              })}
            </MarginRemoveContainer>
          )}
          {editMode && (
            <EditButtonContainer>
              <EditButton variant="contained" color="success" onClick={regenerateMessage}>
                Regenerate
              </EditButton>
              {restoreMessage && (
                <EditButton variant="contained" color="info" onClick={restoreMessage}>
                  Restore
                </EditButton>
              )}
              <EditButton variant="contained" color="warning" onClick={editMessage}>
                Edit
              </EditButton>
              <EditButton variant="contained" color="error" onClick={deleteMessage}>
                Delete
              </EditButton>
            </EditButtonContainer>
          )}
        </BotMessageContainer>
      </LeftAligner>
    );
  }
);

export default MessageBubble;
