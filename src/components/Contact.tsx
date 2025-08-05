import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, Users } from 'lucide-react';
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { submitContactForm } from "@/utils/api";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone_number: z.string().optional(),
  user_type: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone_number: "",
      user_type: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await submitContactForm(data);
      toast.success("Thank you for contacting us! We'll get back to you soon.");
      form.reset();
    } catch (error: any) {
      toast.error(error?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl bg-cloud rounded-xl p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="w-full">
                        <FormLabel className="block text-sm font-medium text-midnight mb-1 text-left">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate" />
                            <Input
                              placeholder="your@email.com"
                              className="pl-10 w-full"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <div className="w-full">
                        <FormLabel className="block text-sm font-medium text-midnight mb-1 text-left">
                          Mobile
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate" />
                            <Input
                              type="tel"
                              placeholder="Your mobile number"
                              className="pl-10 w-full"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* User Type */}
                <FormField
                  control={form.control}
                  name="user_type"
                  render={({ field }) => (
                    <FormItem>
                      <div className="w-full">
                        <FormLabel className="block text-sm font-medium text-midnight mb-1 text-left">
                          I am a
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate pointer-events-none" />
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="pl-10 w-full">
                                <SelectValue placeholder="Select user type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="investor">Investor</SelectItem>
                                <SelectItem value="advisor">Advisor</SelectItem>
                                <SelectItem value="broker">Broker</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <div className="w-full">
                        <FormLabel className="block text-sm font-medium text-midnight mb-1 text-left">
                          Message
                        </FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="How can we help you?"
                            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    type="submit"
                    className="bg-black text-white hover:bg-gray-800 px-6 md:px-8 py-3 text-sm md:text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Contact Us"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>

  );
};

export default Contact;
