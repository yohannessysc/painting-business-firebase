# Website Iteration Plan

This plan keeps delivery incremental and commit-friendly.

## Iteration 1: Launchable Marketing Homepage

- Brand and visual system for Evolution Painting Solutions
- Hero, service cards, inspiration gallery, contact section
- Placeholder testimonials and temporary internet images
- Mobile-friendly responsive layout

## Iteration 2: Lead Capture and Backend Integration

- Connect quote form to Firebase Functions (`POST /leads`)
- Add form validation and success/error states
- Persist leads in Firestore with source tagging

## Iteration 3: Trust and Conversion Enhancements

- Real testimonials section once available
- Real project portfolio uploads to Firebase Storage
- Before-and-after slider component for project showcases
- Service area and FAQ blocks

## Iteration 4: OpenAI AI Chatbot Lead Assistant

- Floating "Ask Us" chat tab
- OpenAI-powered Q&A for paint/service questions
- Lead qualification flow (name, email, phone, project type)
- Save qualified conversations as leads in Firestore
- Human handoff CTA for quote booking

## Notes

- Temporary image sources should be replaced with owned or licensed business images before production launch.
- Each iteration should be committed separately to keep history clean and easy to review.
