import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const FALLBACK_QUESTIONS = [
  {
    question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    starterCode: `def twoSum(nums, target):
    # Your code here
    pass`
  },
  {
    question: "Given the head of a linked list, reverse the list and return the reversed list.",
    starterCode: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def reverseList(head):
    # Your code here
    pass`
  },
  {
    question: "Given a string s, return the longest palindromic substring in s.",
    starterCode: `def longestPalindrome(s):
    # Your code here
    pass`
  },
  {
    question: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    starterCode: `def trap(height):
    # Your code here
    pass`
  },
  {
    question: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    starterCode: `def groupAnagrams(strs):
    # Your code here
    pass`
  },
  {
    question: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    starterCode: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def inorderTraversal(root):
    # Your code here
    pass`
  },
  {
    question: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    starterCode: `def threeSum(nums):
    # Your code here
    pass`
  },
  {
    question: "Design a data structure that supports adding new words and finding if a string matches any previously added string.",
    starterCode: `class WordDictionary:
    def __init__(self):
        # Initialize your data structure here
        pass

    def addWord(self, word):
        # Add a word to the data structure
        pass

    def search(self, word):
        # Returns true if word is in the data structure
        pass`
  },
  {
    question: "Given a binary tree, determine if it is a valid binary search tree (BST).",
    starterCode: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def isValidBST(root):
    # Your code here
    pass`
  },
  {
    question: "Implement a trie (prefix tree) data structure with insert, search, and startsWith methods.",
    starterCode: `class Trie:
    def __init__(self):
        # Initialize your data structure here
        pass

    def insert(self, word):
        # Insert a word into the trie
        pass

    def search(self, word):
        # Returns if the word is in the trie
        pass

    def startsWith(self, prefix):
        # Returns if there is any word in the trie that starts with the given prefix
        pass`
  },
  {
    question: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    starterCode: `def numIslands(grid):
    # Your code here
    pass`
  },
  {
    question: "Design and implement a data structure for Least Recently Used (LRU) cache.",
    starterCode: `class LRUCache:
    def __init__(self, capacity):
        # Initialize the LRU cache with positive size capacity
        pass

    def get(self, key):
        # Return the value of the key if the key exists, otherwise return -1
        pass

    def put(self, key, value):
        # Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache
        pass`
  },
  {
    question: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.",
    starterCode: `def letterCombinations(digits):
    # Your code here
    pass`
  },
  {
    question: "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
    starterCode: `def permute(nums):
    # Your code here
    pass`
  },
  {
    question: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    starterCode: `def findMedianSortedArrays(nums1, nums2):
    # Your code here
    pass`
  },
];

export async function POST(req: NextRequest) {
  try {
    const { company } = await req.json();
    if (!company || typeof company !== "string") {
      return NextResponse.json({ error: "company required" }, { status: 400 });
    }

    let question: string = "";
    let starterCode: string = "";

    // Try OpenAI API if key is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const system = `You are an AI interviewing assistant.
Generate a single interview question for ${company}.
Randomly choose either:
(1) a LeetCode-style algorithms/data structures problem, or
(2) a systems/design question (high-level design).
Keep it concise: a title and 2–6 lines of details. Do not include the answer.`;

        const response = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: system },
            { role: "user", content: "Generate one question now." },
          ],
        });

        question = response.choices[0]?.message?.content || "";
      } catch (apiError) {
        console.error("OpenAI API failed, using fallback:", apiError);
      }
    } else {
      console.log("OpenAI API key not configured, using fallback questions");
    }

    // Use fallback if OpenAI didn't return a question
    if (!question) {
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUESTIONS.length);
      const selected = FALLBACK_QUESTIONS[randomIndex];
      question = selected.question;
      starterCode = selected.starterCode;
    }

    return NextResponse.json({ question, starterCode });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
