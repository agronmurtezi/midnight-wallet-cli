import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface Props {
  text: string;
}

export const Loader: React.FC<Props> = ({ text }) => {
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, 80);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box>
      <Text color="cyan">{frames[frame]} </Text>
      <Text>{text}</Text>
    </Box>
  );
};
