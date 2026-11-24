# FlowPilot CRM 1.5.8 release checklist

## Local release checks

- Extract the source archive into a clean directory. Run `npm ci` and `npm run verify` using an isolated MongoDB replica set.
- Run `npm audit` and `npm audit --omit=dev`.
- Start the production build and test the landing page, each demo role, responsive views and keyboard navigation.
- Check the submission gallery for consistent 1920 × 1080 widescreen PNGs and a separate 1080 × 1080 landing PNG.

## Before resubmission

- Deploy this release to the live demo and check the public landing page in a signed-out browser. Use the landing page URL as the listing’s Live Demo link.
- Open Live Demo from the landing page and verify Owner, Admin and Member sign-in with synthetic data.
- Upload the cover first, then the matching widescreen screenshots. Upload the square image in the separate landing image slot.
- Confirm that listing copy, seller details, support and legal information reflect the deployment. Review the seller agreement shown during submission.
- Submit the source ZIP and use the [Round 4 reviewer note](marketplace-assets/VIBE96_RESUBMISSION_NOTE_ROUND4.md).

Docker runtime and real-inbox password recovery require separate verification before advertising either as tested.
