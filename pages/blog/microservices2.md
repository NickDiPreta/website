---
title: Building Microservices With Go (Part 2)
date: 07/09/2023
description: Introduction to microservices.
tag: go
author: Nicholas DiPreta
---

Hey there, and welcome to building Microservices With Go. I want to show you how easy it is to build microservices with Go! Over the next set of weeks, and probably months, I am going to go through all of the concepts that I know about building a microservice architecture, and specifically how to do that with Go.

In this part, I want to show you just how easy it is to build a microservice in Go, we're going to be expanding on our last example and moving beyond logging responses, to actually writing http responses.

This is the second part of the introduction to microservices series.

---

## Where we left off

In the previous section of this series, we left off at approximately this part in our code:

```Go
package main

import (
 "log"
 "net/http"
)

func main() {

 // Anything other than 'goodbye'
 http.HandleFunc("/", func(http.ResponseWriter, *http.Request) {
  log.Println("Hello World")
 })

 // Function called when goodbye path is called
 http.HandleFunc("/goodbye", func(http.ResponseWriter, *http.Request) {
  log.Println("Goodbye World")
 })

 http.ListenAndServe(":9090", nil)
}

```

## Reading and Writing to Requests

Now let's jump into reading and writing to requests. We're going to do that by using the response writer and the http request. 

### ResponseWriter

A `ResponseWriter` is an interface used by an HTTP handler to construct an HTTP response.<sup>[1][]</sup> `ResponseWriter` has a number of methods on it. It can do things like writing the headers, the response body, status codes and more. The actual concrete implementation is injected by the Go server when it calls your function.<sup>[2][]</sup>

### http.Request

The `http.Request` is literally the http request. It has things like the path, what the method is, the body that was passed to the server and other information related to the http request.


We can use these two things to read and write to our functions. Let's take a look. The first thing we want to do is to read from the body. How do we do that?

We've already looked at the `http.Request`. An `http.Request` has a field called `Body`. `Body` implements the interface `io.ReadCloser`. What that means is that you can use any of the standard Go libraries for reading from that stream. One of those libraries/packages is obviously `ioutil`. We can use the `ReadAll` method.

```golang copy
	http.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("Hello World")
		d, _ := ioutil.ReadAll(r.Body)
		log.Printf("Data %s", d)
	})
  ```

Let's run this code.

```bash
go run main.go
```

Then curl it in another terminal tab.

```bash
curl -v -d 'Nick' localhost:9090
```

You should get the response:

```bash
go run main.go
2023/07/09 18:35:16 Hello World
2023/07/09 18:35:16 Data Nick
```

This is because the `log.Printf` has written the data. The body was passed as part of the `http.Request`. I've read it using `ioutil.ReadAll` from the request body. Then I've just written that through `log.Print`.

But what we really want to see is how to write that back to the user. We do that using the response writer. `http.ResponseWriter` has a method called `Write` on it. The signature of `Write` is ```Write([byte](int,err))```. This corresponds to `io.writer` which means that I can use a `http.ResponseWriter` anywhere that I can use a `response.Writer`

So for example, `fmt.Fprintf` allows me to use an `io.writer` such as `http.ResponseWriter` with format string. 

```Go

	// Anything other than 'goodbye'
	http.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("Hello World")
		d, _ := ioutil.ReadAll(r.Body)

		fmt.Fprintf(rw, "Hello %s", d)
	})

```

This is now going to print `Hello + data` but this time instead of printing to the log, I'm going to print it back to the response writer, which means it will be returned back to the user. 

If we restart the server and run the curl again, we should get back the response

`Hello Nick`

In a really simple way, with few lines of code, we can read and write to the response. We've created a relatively performant web server really simply. I haven't needed to import or download anything other than the Go standard library.

One thing I didn't touch in the code above is the error returned from `ReadAll`. Good Go programming never just swallows error messages like that. I want to return an error message to the user. So I'm going to write a bad request header. Then I'm going to write an error message. The `http` package has a nice error message method that I'll use.

```Go

	// Anything other than 'goodbye'
	http.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("Hello World")
		d, err := ioutil.ReadAll(r.Body)
    if err != nil {
      http.Error(rw, "Ooops", http.StatusBadRequest)
      return
    }

		fmt.Fprintf(rw, "Hello %s", d)
	})

```

And thats it.  In a dozen or so lines of code we've written a basic web server in go.



[1]: https://pkg.go.dev/net/http#ResponseWriter "Go Docs ResponseWriter documentation"
[2]: https://cs.opensource.google/go/go/+/refs/tags/go1.20.5:src/net/http/server.go;l=95 "Go 1.20.5 src/net/http/server.go"
