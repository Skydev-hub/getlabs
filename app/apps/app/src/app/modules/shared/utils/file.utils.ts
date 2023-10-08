export const parseDataUrl = (data: string): { mimeType: string, content: string } => {
  const parts = data.split(';base64,');
  return {
    mimeType: parts[0] ? parts[0].split(':')[1] : undefined,
    content: parts[1] || undefined,
  };
};
