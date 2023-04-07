import { useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';

// Mantine
import { Button, Select, Stack, TextInput } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { IconTags } from '@tabler/icons-react';

import { createDiscussion } from '~/utils/polybase';

import { type Tag } from '~/types';

export default function DiscussionEditor({
  address,
  tagsData,
}: {
  address: string;
  tagsData: { data: Tag }[];
}) {
  // const [content, setContent] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<{ value: string; label: string }[]>([]);
  const [tagValue, setTagValue] = useState<string | null>('');

  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: 'Write your post here...',
  });

  async function create() {
    setLoading(true);

    const postContent = editor!.getHTML();

    const id = await createDiscussion(
      address.toLowerCase(),
      postTitle,
      postContent,
      tagValue!
    );

    navigate(`/d/${id}`);
  }

  useEffect(() => {
    if (tagsData) {
      const selectTags = tagsData.map(({ data }) => ({
        value: data.id,
        label: data.name,
      }));

      setTags(selectTags);
    }
  }, [tagsData]);

  return (
    <>
      <div className="mx-auto max-w-lg">
        <Stack>
          <TextInput
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Post title"
            label="Title"
            data-autofocus
          />
          <Select
            data={tags}
            value={tagValue}
            onChange={setTagValue}
            label="Tag"
            placeholder="Choose a tag for your discussion"
            icon={<IconTags />}
          />
          <div>
            <RichTextEditor editor={editor} classNames={{ content: 'h-40' }}>
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                  <RichTextEditor.Highlight />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                  <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
          </div>

          <Button
            onClick={create}
            disabled={loading || !postTitle.length || !tagValue!.length}
            loading={loading}
            color="dark.4"
          >
            Create Discussion
          </Button>
        </Stack>
      </div>
    </>
  );
}
