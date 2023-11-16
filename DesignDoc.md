# CS5500-TeamHu

# Chat Feature for Assignment 3

## Design Document

### Nov 3, 2023

- Author: Zhongyu Wei
- Email: wei.zhon@northeastern.edu

### Version History

| Version | Date       | Author  | Description   |
| ------- | ---------- | ------- | ------------- |
| 1.0     | 2023-11-03 | Zhongyu | Initial Draft |
| 1.1     | 2023-11-16 | Jieyu   | Testing cases |
| 1.2     | 2023-11-16 | Saif    | User stories  |

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Requirements](#requirements)
3. [High-Level Design](#high-level-design)
4. [Low-Level Design](#low-level-design)
5. [User Stories](#user-stories)
6. [Testing Documentation](#testing-documentation)

## 1. Problem Statement

The problem is to design a real-time chat system where each participant can exchange messages. The server maintains an ordered list of chat items, and the client displays the latest 20 items. Additionally, an advanced feature allows users to request more chat items.

## 2. Requirements

- Real-time Chat System
- Chat Window in Spreadsheet Editor Page
- Entry Pane for Each Participant
- Server Maintains an Ordered List of Chat Items
- Chat Item Format: "user: message"
- Display Latest 20 Chat Items
- Advanced Feature: Paged Fetch Method for More Chat Items

## 3. High-Level Design

The high-level design of the chat system involves the following components:

### 3.1. System Architecture

- Client-Server Architecture
- Real-time communication using WebSocket

### 3.2. Data Flow

- Messages flow from clients to the server and are maintained in a database
- Clients request and receive chat items from the server

## 4. Low-Level Design

### 4.1. Component A: Client - Saif

- Implements chat window in the spreadsheet editor page
- Provides an entry pane for participants to enter text
- Provides a button for participants to send messages
- Displays the latest 20 chat items
- Allows users to request more chat items via pagination scrolling

### 4.2. Component B: Server - Jieyu

- Receives and stores incoming chat messages for each document, handled by a chat server
- Maintains an ordered list of chat items and the corresponding users
- Provides a paged fetch method for retrieving chat items

### 4.3. Component C: Engine - Zhongyu

- Implements chat client that manages communication between the client and server.
- Implements callback functions for sending 'PUT' requests to the server upon button click.
- Supports real-time updates and notifications through timely fetches.

## 5. User Stories

https://docs.google.com/spreadsheets/d/1PzEV7MQY2duQ-JxkgpjVED2Nbloiqluc-pqrj6nEGoA/edit#gid=0

## 6. Testing Documentation

https://docs.google.com/document/d/1WXT8BYHsOTzZ7qPZuUFLhTrPYDW4apj1KcI9G-Jpn7w/edit#heading=h.um8gxeuedo83

## Conclusion

In conclusion, this design document outlines the requirements and design for a real-time chat system with the specified features. It covers the high-level architecture, component details, and user stories to guide development and testing.

## Appendices

![Design Artefact](media/artefacts.png)
