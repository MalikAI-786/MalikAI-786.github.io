# 004 · M5 / record · streaks are a claim about the calendar

**Slot:** week 2, Thursday · **Format:** text · **Link:** first comment
**Series:** Measures M5, told as a build-record post · **Status:** drafted, awaiting review.

---

## Post

Days since the last incident. Consecutive clean months. Zero-findings quarters. Every one of those is a streak, and a streak reports zero the moment it breaks.

That is a true statement about the calendar and a false one about the control.

I ran into this building a measuring instrument for myself, where the stakes were low enough to experiment and the subject was the only one I am entitled to experiment on. I wanted a daily figure. Daily figures want to be streaks. And a streak is genuinely motivating, which is exactly what makes it dangerous as a metric.

The problem is not that a streak is fragile. It is what a fragile metric does to the person holding it.

Once a counter is load-bearing, the cheapest way to protect it is to protect the counter rather than the thing it stands for. Nobody decides to do this. It happens by increment: the near-miss that does not quite meet the reporting threshold, the finding raised next quarter instead of this one, the day recorded generously because breaking a run of forty felt disproportionate to one bad Thursday.

So the instrument shows streaks and refuses to let them decide anything. The load-bearing figure is a rolling fourteen-day median.

The distinction it turns on is old. Iqbal, writing about time, separates serial time — the clock, discrete units, today ends at midnight — from duration, time lived from the inside, where the past is carried rather than gone. A streak is a serial-time artefact. It asks what the calendar looks like. A median asks what has actually been carried, and it survives a bad Thursday, because a capacity does.

That is not a philosophical flourish. It is a specification. One measure resets to zero on a single event and one does not, and which you put in the load-bearing position determines what your people optimise.

The governance version of this is everywhere and it is mostly unexamined. Ask of any operational metric on your dashboard: what single event takes it to zero, and is that event actually catastrophic, or merely discontinuous? If the answer is the second, you have built an incentive to manage the counter.

What I have not resolved is the honest objection. Medians are harder to explain to a board than "two hundred days clean", and a metric nobody understands does not govern anything. I do not think the answer is to go back to streaks. I am not sure what it is.

The full write-up of the design decisions, including this one and the one I think is weakest, is in the first comment.

#AIGovernance #ModelRisk #OperationalResilience

---

## First comment

Five decisions from building it, what each one costs, and where the design is weak:
https://malikai-786.github.io/instrument.html

---

## Notes

**Hashtag deviation.** `#OperationalResilience` replaces `#InternalAudit` here,
which the platform reference permits — one swap where the specific post has
earned it. This post is about operational metrics, and it should be findable by
the people who own them.

**Register.** Iqbal appears mid-post as a source for a distinction, not as
authority. Delete-the-citation test: the argument stands completely without him
— the serial/duration distinction is doing analytical work that could be stated
in plain metric terms. He is there because he named it well and because naming
the lineage honestly is the feed's standard. This is the right ratio for a
Measures post that is primarily professional.

**Provenance.** Restatement of Iqbal's treatment of serial time and duration in
*The Reconstruction of Religious Thought in Islam* (1930). Not a quotation. If
the post is trimmed, keep the word "writing about time" — it signals that this
is a general position of his, not a claim about metrics that he made.

**No personal data.** The instrument is described structurally: it has a daily
figure, it shows streaks, it uses a rolling fourteen-day median. No reading, no
score, no date, no duration of use. Keep it that way — Safeguard 3 covers his
own record and this post sits closest to that line of anything in the queue.

**Strongest line:** "Once a counter is load-bearing, the cheapest way to protect
it is to protect the counter rather than the thing it stands for."

**Length: 2,552 characters,** over the 2,400 target and inside the 3,000
ceiling. Checked for a second argument: the Iqbal passage on serial time and
duration is not one, because it names the distinction the whole post already
turns on rather than opening a new line of reasoning. If this needs to come
down, the paragraph to cut is the one listing the ways a counter gets protected
— it is illustration, not argument.

## Gaps

- The three examples in the hook (days since incident, consecutive clean months,
  zero-findings quarters) are generic industry metrics, not references to any
  institution he has worked for. Keep them generic.
- The "fourteen-day" figure is a design parameter of his own instrument and is
  accurate to it. It is not offered as a recommended window for anything else,
  and no later draft should generalise it into advice.
- No claim is made about the instrument's results, duration of use, or effect
  on his behaviour. None is available and none may be invented.

## Checklist

Run before posting.
