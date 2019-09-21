# Auto Like Tag Instagram (Working 2019)

I was looking for a script to do the instagram autofollow, but I didn't find anything working, I decided to create one.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

You need to install the script on Instagram, after searching for the tag.

```
https://www.instagram.com/explore/tags/javascript/
```

### Installing

1) Open the auto-like.js (or auto-like.min.js) script, copy the content and paste it into the Google Chrome developer console.

2) Press enter to install the script.

3) To start the script paste these two lines of code into the console and press enter.


```
//Change "javascript" with the tag you searched on instagram
//Change 100, Maximum number of posts
var myAutoLike = new AutoLike("javascript", 100);
myAutoLike.start();
```

Now wait, and enjoy your likes 😎

### Edit timers

If you want to change the timers,next page and like, change the 4 and 5 lines, but be careful not to lower too much, Instagram could block you.

```
this.timerPage = 2000; //ms
this.timerLike = 60000; //ms
```