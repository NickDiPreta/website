---
title: Building Microservices With Go (Part 3)
date: 07/16/2023
description: Introduction to microservices, continued.
tag: go
author: Nicholas DiPreta
---

Hey there, and welcome to building Microservices With Go. I want to show you how easy it is to build microservices with Go! Over the next set of weeks, and probably months, I am going to go through all of the concepts that I know about building a microservice architecture, and specifically how to do that with Go.

Up to now we've been looking at a very simple example of how to build a service in Go. From the code perspective, it looked like this.

```Go
package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func main() {

	// Anything other than 'goodbye'
	http.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("Hello World")
		d, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(rw, "Oops", http.StatusBadRequest)
			return
		}

		fmt.Fprintf(rw, "Hello %s", d)
	})

	// Function called when goodbye path is called
	http.HandleFunc("/goodbye", func(http.ResponseWriter, *http.Request) {
		log.Println("Goodbye World")
	})

	http.ListenAndServe(":9090", nil)
}

```

In this article, we're going to take this and refactor it a little bit. We'll bring in some better patterns and practices for structuring your code. Right now this code is all a bit untidy. We're ending up with a lot of code inside of our main, and testing is not easily done.

---

### Tidy Up Main

Let's first start with our handlers. The first thing we'll do is bring our `HandleFunc` into an independent object. Let's see how we can do that. What I like to do, is create a package for my handlers. To create a package in Go, I'm just going to create a folder called handlers, and then inside of that package, create a file called `hello.go`. The standard start of a Go file is to include the name of the package at the start of the go file.

```Go
// hello.go
package handlers 
```

### Create a Struct

So what we're going to do is create a struct. If you remember back to the last articles, we talked about the `http.HandleFunc` and that under the hood, it converts the function your passing as a parameter to an http handler and registering it to the serve mux. Let's quickly take another look at the `Handler` interface.

```Go
type Handler interface {
  ServeHTTP(ResponseWriter, *Request)
}
```

The `Handler` interface has a single method on it, `ServeHTTP`, which has the same signature as the `handleFunc` that we created. More broadly, for us to create a handler, all we need to do is create a struct which implements the `http.Handler` interface. So let's do that.

```Go
type Hello struct {

}
```

Now, let's add the method which satisfies the `http.Handler` interface. Defining a method on a struct in Go requires you to prefix the function name with the struct type itself, known as the function "receiver". 

```Go
type Hello struct {

}

func (h *Hello) ServeHTTP(rw http.ResponseWriter, r *http.Request)
```

For this function, the first parameter is going to be an `http.ResponseWriter` and the second parameter will be a reference to an `http.Request`, with no return parameters because we'll be writing the response with the response writer.

Next thing we can do, is bring over the handler code from main.

```Go
package handlers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

type Hello struct {
}

func (h *Hello) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	log.Println("Hello World")
	d, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(rw, "Oops", http.StatusBadRequest)
		return
	}

	fmt.Fprintf(rw, "Hello %s", d)
}

```

We can look at a couple of things here. The first thing is that we're using a logger here. That in itself is fine, but we want some control over this logging. I don't want to be directly creating concrete objects inside of the handler if I can avoid it. The reason for that is related to testability. Don't worry too much about that right now. What I want to do right now though is define the pattern that we're going to use.

What I can do is define a field on my handler. I'll call it `l` and it's a type of `*log.Logger`. I'll follow the idiomatic principles of creating Go code, and define a function called `NewHello`, which will take a logger, and return a hello handler as a reference. This is called dependency injection.

```Go
package handlers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

type Hello struct {
	l *log.Logger
}

func NewHello(l *log.Logger) *Hello {
	return &Hello{l}
}

func (h *Hello) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	h.l.Println("Hello World")
	d, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(rw, "Oops", http.StatusBadRequest)
		return
	}

	fmt.Fprintf(rw, "Hello %s", d)
}
```

The benefit of doing this dependency injection here, is that in our test I can replace logger with something else, and not worry too much about the concrete implementation. Sometimes you'll want to log to a file, sometimes to stdout so it's nice to configure that at a broader level. Where it becomes more important is when we start dealing with connecting to databases and connecting to other services, we really need to be able to write good, fast unit tests, which you'll see is made much easier with this pattern.

So let's try to get this up and running. Let's ignore the second handler for now. We need to create a reference to the handler in `main.go`. We also need to initialize a logger to inject into the handler.

```Go

func main() {
	l := log.New(os.Stdout, "product-api", log.LstdFlags)
	hh := handlers.NewHello(l)

	http.ListenAndServe(":9090", nil)
}
```

Now what I need to do is register my handler with my server. We talked about registering a function to the `http.DefaultServeMux`. Internally what's happening, is when a request comes into your server, the server has a default handler, the `DefaultServeMux`. We're going to create a new servemux because using the default makes your code less clear and explicity and poses as security risk because it's stored in a global variable, meaning any package is able to access it and register a route. 

Creating a new servemux is also really easy using the http package.
Then on the servemux, we're going to register our hello handler.

```Go

func main() {
	l := log.New(os.Stdout, "product-api", log.LstdFlags)
	hh := handlers.NewHello(l)

    sm := http.NewServeMux()
    sm.Handle("/", nil)

	http.ListenAndServe(":9090", sm)
}
```

To have our serve use the new servemux we've created, we need to pass that into `http.ListenAndServe`. You might take a look at the function signature for `http.ListenAndServe` and notice that the second parameter is actually an `http.Handler`. However, we can pass the new servemux in because `http.ServeMux` also implements the `http.Handler` interface.

Let's check that out to double check it's working.

`go run main.go`

then

`curl localhost:9090 -d Nick`

In your server you should see the log

```bash
product-api2023/07/16 14:39:14 Hello World
```

then in your curl response you should see the response 

```
Hello Nick
```

Everything is working like it was last time but we've done a refactor,we've cleaned up our main logic, and moved our handler logic into the handler package. Now we can really quickly add another handler in a similar fashion. Let's create a file called `goodbye.go` in our handlers package and define it the same way we did with hello.To shorten the code here, I just wrote a byteslice to the response handler.

```Go
package handlers

import (
	"log"
	"net/http"
)

type Goodbye struct {
	l *log.Logger
}

func NewGoodBye(l *log.Logger) *Goodbye {
	return &Goodbye{l}
}

func (g *Goodbye) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	rw.Write([]byte("Bye"))
}
```

Now back in main, we can create a new instance of the goodbye handler, pass in the same logger that we initialized earlier, and register it with an endpoint to our servemux.


```Go
func main() {
	l := log.New(os.Stdout, "product-api", log.LstdFlags)

	hh := handlers.NewHello(l)
	gh := handlers.NewGoodBye(l)

	sm := http.NewServeMux()
  
	sm.Handle("/", hh)
	sm.Handle("/goodbye", gh)

	http.ListenAndServe(":9090", sm)
}
```

You can see now that this code looks a lot cleaner. We've completely abstracted away the prior complexity, and it's very clear what this code does.

Next article we'll continue on our way to finishing this implementation pattern by talking about server configuration and defaults.
