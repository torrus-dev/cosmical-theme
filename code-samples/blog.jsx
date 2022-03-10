import React, { useState } from 'react';
import '../Styles/css/blog.css'
import BlogSidebar from '../components/BlogSidebar'
import EventIcon from '@mui/icons-material/Event';
import { Link } from 'react-router-dom'
import MetaTags from 'react-meta-tags'
import axios from 'axios'
import dateFormat from 'dateformat'

const Blog = () => {
    const [token, setToken] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [reqerror, setReqerror] = useState("");
    const fetchBlogs = async (token)=>{
        try {
            let data = '';
            let config = {
            method: 'get',
            url: 'http://localhost:5000/api/blogs',
            headers: { 
                'auth-token': `${token}`
            },
            data : data
            };
            axios(config)
            .then((response) => {
                setBlogs(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

        } catch (err) {
            setReqerror(err.message);
        }
    };
    const fetchToken = async () => {
        try{
            const token = await axios.post('http://localhost:5000/api/auth/login/'+userdata.email, userdata);
            setToken(token.data.AuthToken);
            fetchBlogs(token.data.AuthToken);
        }catch(error){
            console.log("check your inputs and retry");
            return "check your inputs and retry";
        };
    }
    
    if(token === null){fetchToken();}
    if(reqerror){console.log(reqerror);}
    //show loader and hide
    setTimeout(() => {
        if(document.querySelector('.lds-ellipsis')!== null){
            document.querySelector('.lds-ellipsis').classList.add('hide');
        }
        if(document.querySelector('.couldnotfetch')!== null){
            document.querySelector('.couldnotfetch').classList.add('show');
        }
    }, 7000);
    return (
        <div>
            <MetaTags>
                <title>blog</title>
                <meta name="description" content="get the latest blog" />
                <meta property="og:title" content="our blog section" />
            </MetaTags>
            <div className="blog">
                <div className="blogContainer">
                    <div className="blogWrapper">
                        <div className="blogFlex">
                            <div className="blogMainArea">
                                {blogs.length === 0? <div className="centerLoader"><div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div><div className="couldnotfetch"><img src="images/could-not-fetch.svg" alt="" /><p style={{color: "var(--text-primary)" }}>Something wrong happened!</p></div></div>:blogs.map(blog=>{
                                    return(
                                <div className="blogPost" key={blog.ID}>
                                    <h2>
                                        
                                        <Link to={blog.BlogLinkPage} >{blog.BlogTitle}</Link>
                                    </h2>
                                    <div className="blogPostCardInfo">
                                        <div className="blogAuthor">
                                        <img src={`http://localhost/admin-panel/uploads/${blog.AuthorImg}`} alt="" />
                                            {/* <img src={`${process.env.PUBLIC_URL}/images/${blog.AuthorImg}`} alt="" /> */}
                                            <div className="authorInfo">
                                                <div className="authorName">
                                                    <Link to="" className="linktoAuthor">{blog.Author}</Link>
                                                </div>
                                                <div className="blogMeta">
                                                    <span className="category">
                                                        <Link to="" className="linkToCategories">{blog.Category}</Link>
                                                    </span>
                                                    <span className="blogDate">{dateFormat(blog.DatePublished, "dddd, mmmm dS, yyyy")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dateColumn">
                                            <p><EventIcon className="eventIcon"/>Last Updated on <span className="updateDate">{dateFormat(blog.DateModified, "dddd, mmmm dS, yyyy")}</span></p>
                                        </div>
                                    </div>
                                    <div className="blogPostthumbnail">
                                        <img className="thumbnailImage" src={`http://localhost/admin-panel/uploads/${blog.BlogThumbnail}`} alt="" />
                                    </div>
                                    <div className="blogPostSummary">
                                        <p dangerouslySetInnerHTML={{ __html: blog.BlogSummary }}></p>
                                        <Link to={blog.BlogLinkPage} className="linkToBlogPost">Continue Reading</Link>
                                    </div>
                                </div>
                                )})}
                            </div>
                            <div className="blogSidebar">
                                <BlogSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Blog