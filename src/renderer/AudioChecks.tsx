type AudioChecksProps = {
  path: string;
};

export function AudioCheck({ path }: AudioChecksProps) {
  return (
    <div>
      {path ? '✅' : '☑️'} {path.split('/').pop()}
    </div>
  );
}
