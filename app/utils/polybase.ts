import { type RevalidationState } from "@remix-run/router";

import { polybase } from "~/root";

/* Utilities */
import { nanoid } from "nanoid";
import dayjs from "dayjs";

export async function callUpdatePost(id: string, content: string) {
  await polybase.collection("Post").record(id).call("updatePost", [content]);
}

export async function callDeletePost(id: string) {
  await polybase.collection("Post").record(id).call("del");
}

export async function createDiscussion(
  address: string,
  postTitle: string,
  postContent: string,
  tag: string
) {
  const { data } = await polybase
    .collection("Post")
    .create([
      nanoid(),
      address,
      dayjs().toISOString(),
      postContent,
      postTitle,
      polybase.collection("Tag").record(tag),
    ]);

  return data.id; // return the ID to navigate to the new discussion
}

export async function callAddPostToDiscussion(
  discussionId: string,
  address: string,
  postContent: string,
  postTitle: string,
  tag: string
) {
  await polybase.collection("Post").create([
    nanoid(),
    address,
    dayjs().toISOString(),
    postContent,
    postTitle, // skip title
    tag, // skip tag
    polybase.collection("Post").record(discussionId),
  ]);
}

export async function callCreateUser(address: string) {
  await polybase.collection("User").create([address, dayjs().toISOString()]);
}

export async function callLikePost(postId: string, userId: string) {
  await polybase
    .collection("Like")
    .create([
      nanoid(),
      polybase.collection("Post").record(postId),
      polybase.collection("User").record(userId),
    ]);
}

export async function callSetAvatar(
  id: string,
  file: File,
  revalidator: {
    revalidate: () => void;
    state: RevalidationState;
  }
) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = async () => {
    await polybase
      .collection("User")
      .record(id)
      .call("setAvatar", [reader.result as string]);

    revalidator.revalidate();
  };
}
