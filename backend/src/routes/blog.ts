import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import {createPostInput, updatePostInput} from "@gkdevdemo/medium-common-app"


export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    },
    Variables: {
        userId: string
    }
}>();

blogRouter.use("/*", async (c, next) => {
  //get the header
  // verify the header
  // if the header is correct ,we need can proceed
  // if not, we return the user a 403 status code

  const header = c.req.header("authorization") || "";
  
  const res = await verify(header, c.env.JWT_SECRET);
try {
    if (res) {
      c.set("userId", res.id);
      await next();
    } else {
      c.status(403);
      return c.json({ message: "You are not logged in" });
    }
} catch (error) {
   c.status(403);
   return c.json({
     message: "You are not logged in",
   });
}
  

 
});

blogRouter.post("/", async (c) => {

     const prisma = new PrismaClient({
       datasourceUrl: c.env.DATABASE_URL,
     }).$extends(withAccelerate());

    const body = await c.req.json();

     const { success } = createPostInput.safeParse(body);
     if (!success) {
       c.status(411);
       return c.json({
         message: "Inputs not correct",
       });
     }

    const userId = c.get("userId")
    
    const post  = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId
        }
    })

    return c.json({
      id: post.id
  });
});
blogRouter.put("/", async (c) => {
  
     const prisma = new PrismaClient({
       datasourceUrl: c.env.DATABASE_URL,
     }).$extends(withAccelerate());

    const body = await c.req.json();
     const { success } = updatePostInput.safeParse(body);
     if (!success) {
       c.status(411);
       return c.json({
         message: "Inputs not correct",
       });
     }

    const post = await prisma.post.update({
        where: {
             id: body.id
         },
       data: {
         title: body.title,
         content: body.content,
        
       },
     });

     return c.json({
       id: post.id,
     });
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const posts = await prisma.post.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      author: {
        select: {
          name: true
        }
      }
    }
  });

  return c.json({
    posts,
  });
});

blogRouter.get("/:id", async (c) => {

    const id = c.req.param("id");
  
     const prisma = new PrismaClient({
       datasourceUrl: c.env.DATABASE_URL,
     }).$extends(withAccelerate());

    

   try {
     const post = await prisma.post.findFirst({
       where: {
         id: id,
       },
       select: {
         id: true,
         title: true,
         content: true,
         author: {
           select: {
             name:true
           }
         }
         
       }
     });

     return c.json({
       post,
     });
   } catch (e) {
       c.status(411)
       return c.json({
           message: "Error while fetching blog post."
       })
   }
});
